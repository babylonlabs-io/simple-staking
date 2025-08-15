import config from "@/infrastructure/config";

interface CurrentEpochResponse {
  current_epoch: number;
}

export const getCurrentEpoch = async (): Promise<number> => {
  const url = `${config.babylon.lcdUrl}/babylon/epoching/v1/current_epoch`;

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Error fetching current epoch from ${url}. HTTP ${res.status}: ${res.statusText}`);
  }

  const data: CurrentEpochResponse = await res.json();
  return data.current_epoch;
};
