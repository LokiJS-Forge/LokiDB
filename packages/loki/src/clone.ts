export enum CloneMethod {
  PARSE_STRINGIFY,
  DEEP,
  SHALLOW,
  SHALLOW_ASSIGN,
  SHALLOW_RECURSE_OBJECTS,
}

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
export function clone<T>(data: T, method: CloneMethod = CloneMethod.PARSE_STRINGIFY): T {
  if (data === null || data === undefined) {
    return null;
  }

  let cloned: any;

  switch (method) {
    case CloneMethod.PARSE_STRINGIFY:
      cloned = JSON.parse(JSON.stringify(data));
      break;
    case CloneMethod.DEEP:
      cloned = deepCopy(data);
      break;
    case CloneMethod.SHALLOW:
      cloned = Object.create(data.constructor.prototype);
      Object.assign(cloned, data);
      break;
    case CloneMethod.SHALLOW_RECURSE_OBJECTS:
      // shallow clone top level properties
      cloned = clone(data, CloneMethod.SHALLOW);
      const keys = Object.keys(data);
      // for each of the top level properties which are object literals, recursively shallow copy
      for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        if (typeof data[key] === "object" && data[key].constructor.name === "Object") {
          cloned[key] = clone(data[key], CloneMethod.SHALLOW_RECURSE_OBJECTS);
        }
      }
      break;
    default:
      break;
  }

  return cloned as any as T;
}
