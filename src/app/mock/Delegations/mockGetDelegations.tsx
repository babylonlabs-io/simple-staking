import { encode } from "url-safe-base64";
import { generateRandomDelegationData } from "./mockGenerateDelegationsData";
import { Delegations } from "@/app/api/getDelegations";

const allMockData = generateRandomDelegationData(1000);

export const mockGetDelegations = async (key: string, publicKeyNoCoord?: string): Promise<Delegations> => {

  if (!publicKeyNoCoord) {
    throw new Error("No public key provided");
  }

  const pageSize = 100;
  const pageIndex = parseInt(key) || 0;
  const startIndex = pageIndex * pageSize;
  const endIndex = startIndex + pageSize;

  const data = allMockData.slice(startIndex, endIndex);
  const nextKey = endIndex >= allMockData.length ? null : pageIndex + 1;

  return {
    data,
    pagination: {
      next_key: nextKey?.toString() || ""
    }
  };
};