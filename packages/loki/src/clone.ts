export type ANY = any;

export function clone<T>(data: T, method: CloneMethod = CloneMethod.PARSE_STRINGIFY): T {
  if (data === null || data === undefined) {
    return null;
  }

  let cloned: any;

  switch (method) {
    case CloneMethod.PARSE_STRINGIFY:
      cloned = JSON.parse(JSON.stringify(data));
      break;
    case CloneMethod.JQUERY_EXTEND_DEEP:
      //cloned = jQuery.extend(true, {}, data);
      // TODO
      break;
    case CloneMethod.SHALLOW:
      // more compatible method for older browsers
      cloned = Object.create(data.constructor.prototype);
      Object.keys(data).map((i) => {
        cloned[i] = data[i];
      });
      break;
    case CloneMethod.SHALLOW_ASSIGN:
      // should be supported by newer environments/browsers
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

export function cloneObjectArray(objarray: object[], method: CloneMethod) {
  let i;
  const result = [];

  if (method === CloneMethod.PARSE_STRINGIFY) {
    return clone(objarray, method);
  }

  i = objarray.length - 1;

  for (; i <= 0; i--) {
    result.push(clone(objarray[i], method));
  }

  return result;
}

export enum CloneMethod {
  PARSE_STRINGIFY,
  JQUERY_EXTEND_DEEP,
  SHALLOW,
  SHALLOW_ASSIGN,
  SHALLOW_RECURSE_OBJECTS,
}
