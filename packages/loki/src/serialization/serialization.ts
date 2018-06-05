import {V2_0, V2_0 as Serialization} from "./v2_0";
import {V1_5} from "./v1_5";
import {Dict} from "../../../common/types";

export {Serialization};

export type MergeRightBiased<TLeft, TRight> =
  TLeft extends any[] ? TRight :
    TRight extends any[] ? TRight :
      TRight extends Function ? TRight :
        TLeft extends object ?
          TRight extends object ? {
            // All properties of Left and Right, recursive
            [P in keyof TLeft & keyof TRight]: MergeRightBiased<TLeft[P], TRight[P]>
          } & {
            // All properties of Left not in Right
            [P in Exclude<keyof TLeft, keyof TRight>]: TLeft[P];
          } & {
            // All properties of Right not in Left
            [P in Exclude<keyof TRight, keyof TLeft>]: TRight[P]
          }
            // Prefer Right
            : TRight
          : TRight;

function isObject(t: any): t is object {
  return t !== null && typeof t === "object" && !Array.isArray(t);
}

/**
 * Merges two objects to one using a proxy.
 * The properties of the right object are preferred.
 * @param {TLeft} left - the unfavored left object
 * @param {TRight} right - the favoured right object
 * @returns {MergeRightBiased<TLeft, TRight>}
 * @hidden
 */
export function mergeRightBiasedWithProxy<TLeft, TRight>(left: TLeft, right: TRight): MergeRightBiased<TLeft, TRight> {
  return new Proxy({},
    {
      get: function (target, prop) {
        if (target.hasOwnProperty(prop)) {
          return target[prop];
        }
        if (isObject(right) && right.hasOwnProperty(prop)) {
          if (isObject(right[prop]) && isObject(left) && isObject(left[prop])) {
            return mergeRightBiasedWithProxy(left[prop], right[prop]);
          }
          return right[prop];
        }
        if (isObject(left) && left.hasOwnProperty(prop)) {
          return left[prop];
        }
        return undefined;
      }
    }
  ) as any;
}

function convertV1_5toV2_0(obj: V1_5.Loki): V2_0.Loki {

  function convertCloneMethod(clone: V1_5.CloneMethod): V2_0.CloneMethod {
    switch (clone) {
      case "jquery-extend-deep":
        return "deep";
      case "shallow-assign":
        return "shallow";
      case "shallow-recurse-objects":
        return "shallow-recurse";
      default:
        return clone;
    }
  }

  return mergeRightBiasedWithProxy(obj,
    {
      databaseVersion: 2.0 as 2.0,
      collections: obj.collections.map(coll => mergeRightBiasedWithProxy(coll, {
        dynamicViews: coll.DynamicViews.map(dv => mergeRightBiasedWithProxy(dv, {
          persistent: dv.options.persistent,
          sortPriority: dv.options.sortPriority,
          minRebuildInterval: dv.options.minRebuildInterval,
          resultSet: mergeRightBiasedWithProxy(dv.resultset, {
            filteredRows: dv.resultset.filteredrows,
            scoring: null
          }),
          sortByScoring: false,
          sortCriteriaSimple: {
            field: dv.sortCriteriaSimple.propname
          },
        })),
        cloneMethod: convertCloneMethod(coll.cloneMethod),
        transforms: coll.transforms as any as Dict<V2_0.Transform[]>, // TODO not accurate
        nestedProperties: [],
        ttl: undefined,
        ttlInterval: undefined,
        fullTextSearch: null,
      }))
    });
}

export function deserializeLegacyDB(obj: Serialization.Serialized): Serialization.Loki {
  if (obj.databaseVersion === 1.5) {
    return deserializeLegacyDB(convertV1_5toV2_0(obj as V1_5.Loki));
  }
  return obj as Serialization.Loki;
}
