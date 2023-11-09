export const isEmpty = (obj: Record<string, any> | any[]) => {
  return Object.keys(obj).length === 0 && obj.constructor === Object;
};
