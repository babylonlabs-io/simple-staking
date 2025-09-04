import { useCallback } from "react";

import { verifyBTCAddress } from "../../api/verifyBTCAddress";
import {
  clearBtcAddressScreeningResult,
  getBtcAddressScreeningResult,
  setBtcAddressScreeningResult,
} from "../../utils/local_storage/addressScreeningStorage";
import { useLogger } from "../useLogger";

export function useAddressScreeningService() {
  const logger = useLogger();

  const screenAddress = useCallback(
    async (btcAddress: string) => {
      try {
        // Check cache first
        const cachedResult = getBtcAddressScreeningResult();
        if (cachedResult && cachedResult.btcAddress === btcAddress) {
          return cachedResult.failedRiskAssessment;
        }

        // Perform screening
        const riskAssessment = await verifyBTCAddress(btcAddress);
        const failedRiskAssessment = !riskAssessment;

        // Cache result
        setBtcAddressScreeningResult(btcAddress, failedRiskAssessment);

        logger.info("Address screening completed", {
          btcAddress,
          failedRiskAssessment,
        });

        return failedRiskAssessment;
      } catch (error: any) {
        logger.error(error, { data: { btcAddress } });
        return false; // Default to safe
      }
    },
    [logger],
  );

  const clearAddressScreeningResult = useCallback(() => {
    clearBtcAddressScreeningResult();
  }, []);

  return {
    screenAddress,
    clearAddressScreeningResult,
  };
}
