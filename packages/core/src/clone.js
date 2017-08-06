export function clone(data, method) {
  if (data === null || data === undefined) {
    return null;
  }

  const cloneMethod = method || 'parse-stringify';
  let cloned;

  switch (cloneMethod) {
    case "parse-stringify":
      cloned = JSON.parse(JSON.stringify(data));
      break;
    case "jquery-extend-deep":
      cloned = jQuery.extend(true, {}, data);
      break;
    case "shallow":
			// more compatible method for older browsers
      cloned = data.prototype ? Object.create(data.prototype) : {};
      Object.keys(data).map((i) => {
        cloned[i] = data[i];
      });
      break;
    case "shallow-assign":
			// should be supported by newer environments/browsers
      cloned = data.prototype ? Object.create(data.prototype) : {};
      Object.assign(cloned, data);
      break;
    default:
      break;
  }

  return cloned;
}

export function cloneObjectArray(objarray, method) {
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
