/**
 * Created by toni on 1/27/17.
 */
export function copyProperties(src, dest) {
  let prop;
  for (prop in src) {
    dest[prop] = src[prop];
  }
}

// used to recursively scan hierarchical transform step object for param substitution
function resolveTransformObject(subObj, params, depth) {
  let prop;
  let pname;

  if (typeof depth !== 'number') {
    depth = 0;
  }

  if (++depth >= 10) return subObj;

  for (prop in subObj) {
    if (typeof subObj[prop] === 'string' && subObj[prop].indexOf("[%lktxp]") === 0) {
      pname = subObj[prop].substring(8);
      if (params[pname] !== undefined) {
        subObj[prop] = params[pname];
      }
    } else if (typeof subObj[prop] === "object") {
      subObj[prop] = resolveTransformObject(subObj[prop], params, depth);
    }
  }

  return subObj;
}
// top level utility to resolve an entire (single) transform (array of steps) for parameter substitution
export function resolveTransformParams(transform, params) {
  let idx;
  let clonedStep;
  const resolvedTransform = [];

  if (typeof params === 'undefined') return transform;

	// iterate all steps in the transform array
  for (idx = 0; idx < transform.length; idx++) {
		// clone transform so our scan and replace can operate directly on cloned transform
    clonedStep = JSON.parse(JSON.stringify(transform[idx]));
    resolvedTransform.push(resolveTransformObject(clonedStep, params));
  }

  return resolvedTransform;
}
