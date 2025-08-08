export const plainObjectToInstanceUtil = <T>(
  cls: new (...args: any[]) => T,
  plain: object,
): T => {
  return Object.assign(Object.create(cls.prototype), plain);
};
