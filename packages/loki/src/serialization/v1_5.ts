import {Dict} from "../../../common/types";

export namespace V1_5 {

  export interface Serialized {
    databaseVersion: number;
  }

  export type Doc = {
    $loki: number;
    meta?: {
      created: number;
      revision: number;
      version: number,
      updated?: number;
    };
    [index: string]: any;
    [index: number]: any;
  };

  export interface Loki {
    filename: string;
    collections: Collection[];
    databaseVersion: 1.5;
    engineVersion: number;
    throttledSaves: boolean;
    ENV: "NODEJS" | "NATIVESCRIPT" | "CORDOVA" | "BROWSER";
  }

  export interface BinaryIndex {
    name: string;
    dirty: boolean;
    values: number[];
  }

  export type Transform = {
    type: "find";
    value: ResultSet.Query | string;
  } | {
    type: "where";
    value: ((obj: Doc) => boolean) | string;
  } | {
    type: "simplesort";
    property: string;
    options?: boolean | ResultSet.SimpleSortOptions;
  } | {
    type: "compoundsort";
    value: (string | [string, boolean])[];
  } | {
    type: "sort";
    value: (a: Doc, b: Doc) => number;
  } | {
    type: "limit";
    value: number;
  } | {
    type: "offset";
    value: number;
  } | {
    type: "map";
    value: (obj: Doc, index: number, array: Doc[]) => any;
    dataOptions?: ResultSet.DataOptions;
  } | {
    type: "eqJoin";
    joinData: Collection | ResultSet;
    leftJoinKey: string | ((obj: any) => string);
    rightJoinKey: string | ((obj: any) => string);
    mapFun?: (left: any, right: any) => any;
    dataOptions?: ResultSet.DataOptions;
  } | {
    type: "mapReduce";
    mapFunction: 2,//(item: Doc<object>, index: number, array: Doc<object>[]) => any;
    reduceFunction: (array: any[]) => any;
  } | {
    type: "update";
    value: (obj: Doc) => any;
  } | {
    type: "remove";
  };

  export interface Collection {
    name: string;
    data: Doc[];
    idIndex: number[];
    binaryIndices: {
      [key: string]: BinaryIndex;
    };
    uniqueNames: string[];
    transforms: Dict<Transform[]>;
    objType: string; // ??
    dirty: boolean; // ??
    asyncListeners: boolean;
    adaptiveBinaryIndices: boolean;
    transactional: boolean;
    cloneObjects: boolean;
    cloneMethod: CloneMethod;
    disableMeta: boolean;
    disableChangesApi: boolean;
    disableDeltaChangesApi: boolean;
    autoupdate: boolean;
    serializableIndices: boolean;
    maxId: number;
    DynamicViews: DynamicView[];
    events: {};
    changes: any[];
  }

  export interface ResultSet {
    filteredrows: number[];
    filterInitialized: boolean;
  }

  export namespace ResultSet {

    export interface SimpleSortOptions {
      desc?: boolean;
      disableIndexIntersect?: boolean;
      forceIndexIntersect?: boolean;
      useJavascriptSorting?: boolean;
    }

    export interface DataOptions {
      forceClones: boolean;
      forceCloneMethod: CloneMethod;
      removeMeta: boolean;
    }

    export type Query = any;
  }

  export type CloneMethod = "parse-stringify" | "jquery-extend-deep" | "shallow" | "shallow-assign" | "shallow-recurse-objects";

  export interface DynamicView {
    name: string;
    rebuildPending: boolean;
    options: {
      persistent: true;
      sortPriority: "passive" | "active";
      minRebuildInterval: number;
    };
    resultset: ResultSet;
    filterPipeline: ({
      type: "find";
      val: ResultSet.Query;
      uid: number
    } | {
      type: "where";
      val: (doc: Doc) => boolean;
      uid: number
    })[];
    sortCriteria: (string | [string, boolean])[];
    sortCriteriaSimple: {
      propname: string;
      options: boolean | ResultSet.SimpleSortOptions;
    };
    sortDirty: boolean;
  }
}
