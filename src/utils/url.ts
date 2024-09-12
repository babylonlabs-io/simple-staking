const URL_REGEX = /^https:\/\//;

export function isValidUrl(url: string) {
  return URL_REGEX.test(url);
}
