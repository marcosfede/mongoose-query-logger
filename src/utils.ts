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
