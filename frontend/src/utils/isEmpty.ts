export const isEmpty = (obj: Record<string, any> | any[]) => {
  return obj && Object.keys(obj).length === 0 && obj.constructor === Object;
};
