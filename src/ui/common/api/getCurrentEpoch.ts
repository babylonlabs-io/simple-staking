import config from "@/infrastructure/config";

interface CurrentEpochResponse {
  current_epoch: number;
}

/**
 * Gets the current epoch from the Babylon LCD.
 * @returns {Promise<number>} - The current epoch.
 */
export const getCurrentBabylonEpoch = async (): Promise<number> => {
  const url = `${config.babylon.lcdUrl}/babylon/epoching/v1/current_epoch`;

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(
      `Error fetching current Babylon epoch from ${url}. HTTP ${res.status}: ${res.statusText}`,
    );
  }

  const data: CurrentEpochResponse = await res.json();
  return data.current_epoch;
};
