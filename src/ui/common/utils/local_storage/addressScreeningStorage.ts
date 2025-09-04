import { network } from "@/ui/common/config/network/bbn";

export const BTC_ADDRESS_SCREENING_KEY = `btc-address-screening-${network}`;

export interface BtcAddressScreening {
  btcAddress: string;
  failedRiskAssessment: boolean;
}

export function getBtcAddressScreeningResult():
  | BtcAddressScreening
  | undefined {
  try {
    const value = localStorage.getItem(BTC_ADDRESS_SCREENING_KEY);
    if (!value) return undefined;
    const parsed = JSON.parse(value);
    return parsed;
  } catch {
    return undefined;
  }
}

export function setBtcAddressScreeningResult(
  address: string,
  failedRiskAssessment: boolean = false,
): void {
  try {
    if (!address) return;
    localStorage.setItem(
      BTC_ADDRESS_SCREENING_KEY,
      JSON.stringify({ btcAddress: address, failedRiskAssessment }),
    );
  } catch {
    /* noop */
  }
}

export function clearBtcAddressScreeningResult(): void {
  try {
    localStorage.removeItem(BTC_ADDRESS_SCREENING_KEY);
  } catch {
    /* noop */
  }
}
