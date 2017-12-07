export type CloneMethod = "parse-stringify" | "deep" | "shallow" | "shallow-recurse-objects";

function add(copy: any, key: any, value: any) {
  if (copy instanceof Array) {
    copy.push(value);
    return copy[copy.length - 1];
  }
  else if (copy instanceof Object) {
    copy[key] = value;
    return copy[key];
  }
}

function walk(target: any, copy: any) {
  for (let key in target) {
    let obj = target[key];
    if (obj instanceof Date) {
      let value = new Date(obj.getTime());
      add(copy, key, value);
    }
    else if (obj instanceof Function) {
      let value = obj;
      add(copy, key, value);
    }
    else if (obj instanceof Array) {
      let value: any[] = [];
      let last = add(copy, key, value);
      walk(obj, last);
    }
    else if (obj instanceof Object) {
      let value = {};
      let last = add(copy, key, value);
      walk(obj, last);
    }
    else {
      let value = obj;
      add(copy, key, value);
    }
  }
}

// Deep copy from Simeon Velichkov.
/**
 * @param target
 * @returns {any}
 */
function deepCopy(target: any) {
  if (/number|string|boolean/.test(typeof target)) {
    return target;
  }
  if (target instanceof Date) {
    return new Date(target.getTime());
  }

  const copy = (target instanceof Array) ? [] : {};
  walk(target, copy);
  return copy;
}

/**
 * @hidden
 */
export function clone<T>(data: T, method: CloneMethod = "parse-stringify"): T {
  if (data === null || data === undefined) {
    return null;
  }

  let cloned: any;

  switch (method) {
    case "parse-stringify":
      cloned = JSON.parse(JSON.stringify(data));
      break;
    case "deep":
      cloned = deepCopy(data);
      break;
    case "shallow":
      cloned = Object.create(data.constructor.prototype);
      Object.assign(cloned, data);
      break;
    case "shallow-recurse-objects":
      // shallow clone top level properties
      cloned = clone(data, "shallow");
      const keys = Object.keys(data);
      // for each of the top level properties which are object literals, recursively shallow copy
      for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        if (typeof data[key] === "object" && data[key].constructor.name === "Object") {
          cloned[key] = clone(data[key], "shallow-recurse-objects");
        }
      }
      break;
    default:
      break;
  }

  return cloned as any as T;
}
