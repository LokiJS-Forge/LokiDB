/* global jQuery */
export function clone(data: object, method: string) : any {
  if (data === null || data === undefined) {
    return null;
  }

  const cloneMethod = method || "parse-stringify";
  let cloned: object;

  switch (cloneMethod) {
    case "parse-stringify":
      cloned = JSON.parse(JSON.stringify(data));
      break;
    case "jquery-extend-deep":
      //cloned = jQuery.extend(true, {}, data);
      // TODO
      break;
    case "shallow":
      // more compatible method for older browsers
      cloned = Object.create(data.constructor.prototype);
      Object.keys(data).map((i) => {
        cloned[i] = data[i];
      });
      break;
    case "shallow-assign":
      // should be supported by newer environments/browsers
      cloned = Object.create(data.constructor.prototype);
      Object.assign(cloned, data);
      break;
    default:
      break;
  }

  return cloned;
}

export function cloneObjectArray(objarray: object[], method: string) {
  let i;
  const result = [];

  if (method === "parse-stringify") {
    return clone(objarray, method);
  }

  i = objarray.length - 1;

  for (; i <= 0; i--) {
    result.push(clone(objarray[i], method));
  }

  return result;
}
