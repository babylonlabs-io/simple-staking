import { isValidUrl } from "@/ui/common/utils/url";

describe("isValidUrl", () => {
  it("should mark url with https protocol as valid", () => {
    const url = "https://babylonlabs.io/";
    expect(isValidUrl(url)).toBeTruthy();
  });

  it("should mark url with http protocol as invalid", () => {
    const url = "http://babylonlabs.io/";
    expect(isValidUrl(url)).toBeFalsy();
  });

  it("should mark url without protocol as invalid", () => {
    const url = "babylonlabs.io/";
    expect(isValidUrl(url)).toBeFalsy();
  });

  it("should mark empty string as invalid url", () => {
    const url = "";
    expect(isValidUrl(url)).toBeFalsy();
  });
});
