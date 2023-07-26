function fetchFromObject(obj: any, prop: string): any {

  if (typeof obj === 'undefined') {
    return;
  }

  var _index = prop.indexOf('.')
  if (_index > -1) {
    const newObj = obj[prop.substring(0, _index)]

    return fetchFromObject(newObj, prop.substr(_index + 1));
  }

  return obj[prop];
}

export default fetchFromObject
