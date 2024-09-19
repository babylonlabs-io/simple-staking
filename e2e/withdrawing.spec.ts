import { expect, test } from "@playwright/test";

import { DelegationState } from "@/app/types/delegations";
import { getState } from "@/utils/getState";
import { getIntermediateDelegationsLocalStorageKey } from "@/utils/local_storage/getIntermediateDelegationsLocalStorageKey";
import { getPublicKeyNoCoord } from "@/utils/wallet";

import { setupWalletConnection } from "./helper/connect";
import { interceptRequest } from "./helper/interceptRequest";
import { nativeSegwitMainnetUnbondedTX } from "./mock/mainnet/nativeSegwit/withdrawing";
import { taprootMainnetUnbondedTX } from "./mock/mainnet/taproot/withdrawing";
import { nativeSegwitSignetUnbondedTX } from "./mock/signet/nativeSegwit/withdrawing";
import { taprootSignetUnbondedTX } from "./mock/signet/taproot/withdrawing";

// Define the network and address types
type Network = "mainnet" | "signet";
type AddressType = "taproot" | "nativeSegwit";

// Determine the network from the environment variable or default to 'mainnet'
const network: Network =
  (process.env.NEXT_PUBLIC_NETWORK as Network) || "mainnet";

// Define the address types to test
const addressTypes: AddressType[] = ["taproot", "nativeSegwit"];

// Mapping for unbonded transactions based on network and address type
const unbondedTXMap: Record<AddressType, Record<Network, any>> = {
  nativeSegwit: {
    mainnet: nativeSegwitMainnetUnbondedTX,
    signet: nativeSegwitSignetUnbondedTX,
  },
  taproot: {
    mainnet: taprootMainnetUnbondedTX,
    signet: taprootSignetUnbondedTX,
  },
};

test.describe("Create withdrawing transaction", () => {
  // Iterate over each address type
  for (const type of addressTypes) {
    test.describe(`${type} address on ${network}`, () => {
      test(`prepare the withdrawing using ${type}`, async ({ page }) => {
        // Intercept the GET request for delegations
        await interceptRequest(
          page,
          "**/v1/staker/delegations**",
          200,
          unbondedTXMap[type][network],
        );

        // Setup wallet connection
        await setupWalletConnection(page, network, type);

        // Initiate withdrawal
        await page.getByRole("button", { name: "Withdraw" }).click();
        await page.getByRole("button", { name: "Proceed" }).click();

        // Verify the intermediate withdrawal state
        await expect(
          page.getByText(getState(DelegationState.INTERMEDIATE_WITHDRAWAL)),
        ).toBeVisible();

        // Retrieve the public key from the wallet
        const publicKeyHex = await page.evaluate(
          async () => await window.btcwallet.getPublicKeyHex(),
        );
        const publicKeyNoCoord =
          getPublicKeyNoCoord(publicKeyHex).toString("hex");

        // Verify the local storage has the correct staking details
        const item = await page.evaluate(
          (key: string) => localStorage.getItem(key),
          getIntermediateDelegationsLocalStorageKey(publicKeyNoCoord),
        );

        expect(item).not.toBeNull();
        const parsed = JSON.parse(item as string);
        expect(parsed).toHaveLength(1);
        expect(parsed[0].state).toBe(DelegationState.INTERMEDIATE_WITHDRAWAL);
      });

      test(`withdrawn for ${type} on ${network}`, async ({ page }) => {
        // Modify the unbondedTX to reflect "withdrawn"
        const updatedTX = {
          ...unbondedTXMap[type][network],
          data: unbondedTXMap[type][network].data.map((tx: any) => ({
            ...tx,
            state: DelegationState.WITHDRAWN,
          })),
        };

        // Intercept the GET request for updated delegation
        await interceptRequest(
          page,
          "**/v1/staker/delegations**",
          200,
          updatedTX,
        );

        // Setup wallet connection
        await setupWalletConnection(page, network, type);

        // Verify the withdrawn state is visible
        await expect(page.getByText("Withdrawn")).toBeVisible();

        // Retrieve the public key from the wallet
        const publicKeyHex = await page.evaluate(
          async () => await window.btcwallet.getPublicKeyHex(),
        );
        const publicKeyNoCoord =
          getPublicKeyNoCoord(publicKeyHex).toString("hex");

        // Verify the local storage has been cleared
        const item = await page.evaluate(
          (key: string) => localStorage.getItem(key),
          getIntermediateDelegationsLocalStorageKey(publicKeyNoCoord),
        );
        expect(item).toBe("[]");
        const parsed = JSON.parse(item as string);
        expect(parsed).toHaveLength(0);
      });
    });
  }
});
