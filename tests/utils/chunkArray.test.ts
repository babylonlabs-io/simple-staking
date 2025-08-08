import { chunkArray } from "@/ui/common/utils/chunkArray";

describe("chunkArray", () => {
  it("should split an array into chunks of the specified size", () => {
    const array = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    const chunkSize = 3;
    const expectedResult = [
      [1, 2, 3],
      [4, 5, 6],
      [7, 8, 9],
    ];
    expect(chunkArray(array, chunkSize)).toEqual(expectedResult);
  });

  it("should handle an array with a length not exactly divisible by the chunk size", () => {
    const array = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const chunkSize = 3;
    const expectedResult = [[1, 2, 3], [4, 5, 6], [7, 8, 9], [10]];
    expect(chunkArray(array, chunkSize)).toEqual(expectedResult);
  });

  it("should handle an empty array", () => {
    const array: any[] = [];
    const chunkSize = 3;
    const expectedResult: any[] = [];
    expect(chunkArray(array, chunkSize)).toEqual(expectedResult);
  });

  it("should handle a chunk size larger than the array length", () => {
    const array = [1, 2, 3];
    const chunkSize = 5;
    const expectedResult = [[1, 2, 3]];
    expect(chunkArray(array, chunkSize)).toEqual(expectedResult);
  });

  it("should handle a chunk size of 1", () => {
    const array = [1, 2, 3];
    const chunkSize = 1;
    const expectedResult = [[1], [2], [3]];
    expect(chunkArray(array, chunkSize)).toEqual(expectedResult);
  });

  it("should handle a chunk size equal to the array length", () => {
    const array = [1, 2, 3];
    const chunkSize = 3;
    const expectedResult = [[1, 2, 3]];
    expect(chunkArray(array, chunkSize)).toEqual(expectedResult);
  });

  it("should handle a chunk size of 0", () => {
    const array = [1, 2, 3];
    const chunkSize = 0;
    expect(() => chunkArray(array, chunkSize)).toThrow("Invalid chunk size");
  });

  it("should handle negative chunk sizes", () => {
    const array = [1, 2, 3];
    const chunkSize = -1;
    expect(() => chunkArray(array, chunkSize)).toThrow("Invalid chunk size");
  });
});
