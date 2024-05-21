import { Delegation } from "@/app/types/delegations";
import { Pagination } from "@/app/types/api";
import { generateRandomDelegationData } from "./mockGenerateDelegationsData";

const allMockData = generateRandomDelegationData(1000);

export interface PaginatedDelegations {
  data: Delegation[];
  pagination: Pagination;
}

export const mockGetDelegations = async (
  key: string,
  publicKeyNoCoord?: string,
): Promise<PaginatedDelegations> => {
  if (!publicKeyNoCoord) {
    throw new Error("No public key provided");
  }

  const pageSize = 100;
  const pageIndex = parseInt(key) || 0;
  const startIndex = pageIndex * pageSize;
  const endIndex = startIndex + pageSize;

  const data = allMockData.slice(startIndex, endIndex);
  const nextKey = endIndex >= allMockData.length ? null : pageIndex + 1;

  const sleep = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));

  await sleep(3000); // mock 3 seconds delay

  return {
    data,
    pagination: {
      next_key: nextKey?.toString() || "",
    },
  };
};
