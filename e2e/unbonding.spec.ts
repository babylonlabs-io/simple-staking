import { expect, test } from "@playwright/test";

import { DelegationState } from "@/app/types/delegations";
import { getState } from "@/utils/getState";
import { getIntermediateDelegationsLocalStorageKey } from "@/utils/local_storage/getIntermediateDelegationsLocalStorageKey";
import { getPublicKeyNoCoord } from "@/utils/wallet";

import { setupWalletConnection } from "./helper/connect";
import { interceptRequest } from "./helper/interceptRequest";
import {
  nativeSegwitMainnetActiveTX,
  nativeSegwitMainnetUnbondingTX,
} from "./mock/mainnet/nativeSegwit/unbonding";
import {
  taprootMainnetActiveTX,
  taprootMainnetUnbondingTX,
} from "./mock/mainnet/taproot/unbonding";
import {
  nativeSegwitSignetActiveTX,
  nativeSegwitSignetUnbondingTX,
} from "./mock/signet/nativeSegwit/unbonding";
import {
  taprootSignetActiveTX,
  taprootSignetUnbondingTX,
} from "./mock/signet/taproot/unbonding";

// Define the network and address types
type Network = "mainnet" | "signet";
type AddressType = "taproot" | "nativeSegwit";

// Determine the network from the environment variable or default to 'mainnet'
const network: Network =
  (process.env.NEXT_PUBLIC_NETWORK as Network) || "mainnet";

// Define the address types to test
const addressTypes: AddressType[] = ["taproot", "nativeSegwit"];

// Mapping for active transactions based on network and address type
const activeTXMap: Record<AddressType, Record<Network, any>> = {
  nativeSegwit: {
    mainnet: nativeSegwitMainnetActiveTX,
    signet: nativeSegwitSignetActiveTX,
  },
  taproot: {
    mainnet: taprootMainnetActiveTX,
    signet: taprootSignetActiveTX,
  },
};

// Mapping for unbonding transactions based on network and address type
const unbondingTXMap: Record<AddressType, Record<Network, any>> = {
  nativeSegwit: {
    mainnet: nativeSegwitMainnetUnbondingTX,
    signet: nativeSegwitSignetUnbondingTX,
  },
  taproot: {
    mainnet: taprootMainnetUnbondingTX,
    signet: taprootSignetUnbondingTX,
  },
};

test.describe("Create unbonding transaction", () => {
  // Iterate over each address type
  for (const type of addressTypes) {
    test.describe(`${type} address on ${network}`, () => {
      test(`should prepare the unbonding using ${type}`, async ({ page }) => {
        // Intercept the GET request for delegations
        await interceptRequest(
          page,
          "**/v1/staker/delegations**",
          200,
          activeTXMap[type][network],
        );

        // Intercept the GET request for unbonding eligibility
        await interceptRequest(page, "**/v1/unbonding/eligibility**", 200);

        // Intercept the POST request for unbonding
        await interceptRequest(page, "**/v1/unbonding", 202, {
          message: "Request accepted",
        });

        // Setup wallet connection
        await setupWalletConnection(page, network, type);

        // Initiate unbonding
        await page.getByRole("button", { name: "Unbond" }).click();
        await page.getByRole("button", { name: "Proceed" }).click();

        // Verify the intermediate unbonding state
        await expect(
          page.getByText(getState(DelegationState.INTERMEDIATE_UNBONDING)),
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
        expect(parsed[0].state).toBe(DelegationState.INTERMEDIATE_UNBONDING);
      });

      test(`unbonding requested for ${type} on ${network}`, async ({
        page,
      }) => {
        // Modify the activeTX to reflect "unbonding requested"
        const updatedTX = {
          ...activeTXMap[type][network],
          data: activeTXMap[type][network].data.map((tx: any) => ({
            ...tx,
            state: DelegationState.UNBONDING_REQUESTED,
          })),
        };

        // Intercept the GET request for updated delegation
        await interceptRequest(
          page,
          "**/v1/staker/delegations**",
          200,
          updatedTX,
        );
        await setupWalletConnection(page, network, type);
        await expect(page.getByText("Unbonding Requested")).toBeVisible();

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

        expect(item).toBe("[]");
        const parsed = JSON.parse(item as string);
        expect(parsed).toHaveLength(0);
      });

      test(`unbonded for ${type} on ${network}`, async ({ page }) => {
        // Modify the activeTX to reflect "unbonded"
        const updatedTX = {
          ...activeTXMap[type][network],
          data: activeTXMap[type][network].data.map((tx: any) => ({
            ...tx,
            state: DelegationState.UNBONDED,
            unbonding_tx: unbondingTXMap[type][network],
          })),
        };

        // Intercept the GET request for updated delegation
        await interceptRequest(
          page,
          "**/v1/staker/delegations**",
          200,
          updatedTX,
        );
        await setupWalletConnection(page, network, type);
        await expect(page.getByText("Unbonded", { exact: true })).toBeVisible();
      });
    });
  }
});
