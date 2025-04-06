export function decodeQueryParam(param?: string | string[]): string | string[] | null {
  if (param === undefined) return null;

  if (Array.isArray(param)) {
    return param.map(item => decodeURIComponent(item));
  }

  return decodeURIComponent(param);
}

export function decodeQueryParamArray(param?: string | string[]): string[] {
  if (!param) return [];

  return Array.isArray(param)
    ? param.map(item => decodeURIComponent(item))
    : [decodeURIComponent(param)];
}