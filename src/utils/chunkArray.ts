// Helper function to split the array into chunks of specified size
export const chunkArray = (array: any[], size: number) => {
  // system error
  if (size <= 0) throw new Error("Invalid chunk size");

  const result = [];
  for (let i = 0; i < array.length; i += size) {
    result.push(array.slice(i, i + size));
  }
  return result;
};
