export function mapObjectValues<T extends object, R>(
  obj: T,
  fn: (value: T[keyof T], key: keyof T) => R
): { [K in keyof T]: R } {
  return Object.fromEntries(Object.entries(obj).map(([key, value]) => [key, fn(value, key as keyof T)])) as {
    [K in keyof T]: R;
  };
}
