const inProps = (key: string, props: string[]) => {
  return props.some(omitKey => {
    return omitKey === key;
  });
};

export function omit(obj: Object, props: string[]) {
  let newObj = {};
  Object.keys(obj).forEach(key => {
    if (!inProps(key, props)) {
      newObj[key] = obj[key];
    }
  });
  return newObj;
}

export function isEmpty(obj: Object): boolean {
  return Object.keys(obj).length === 0 && obj.constructor === Object;
}

export function assert(condition: boolean, msg = 'assertion failed') {
  if (!condition) {
    throw new Error(msg);
  }
}

export function findPropRecursively(obj: Object, prop: string) {
  const keys = Object.keys(obj);
  for (let key of keys) {
    if (key === prop) {
      return obj[key];
    }
    if (obj[key] && typeof obj[key] === 'object') {
      return findPropRecursively(obj[key], prop);
    }
  }
}
