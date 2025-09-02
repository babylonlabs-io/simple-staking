import { network } from "@/ui/common/config/network/bbn";

export const BABY_CURRENT_EPOCH_KEY = `baby-current-epoch-${network}`;

export function getCurrentEpoch(): number | undefined {
  try {
    const value = localStorage.getItem(BABY_CURRENT_EPOCH_KEY);
    if (!value) return undefined;
    const parsed = parseInt(value, 10);
    return Number.isNaN(parsed) ? undefined : parsed;
  } catch {
    return undefined;
  }
}

export function setCurrentEpoch(epoch: number): void {
  try {
    if (!Number.isFinite(epoch)) return;
    localStorage.setItem(BABY_CURRENT_EPOCH_KEY, String(epoch));
  } catch {
    /* noop */
  }
}
