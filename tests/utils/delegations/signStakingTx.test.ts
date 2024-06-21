import { signStakingTx } from "@/utils/delegations/signStakingTx";
import { toNetwork } from "@/utils/wallet";
import { Network } from "@/utils/wallet/wallet_provider";

import { DataGenerator } from "../../helper";

// Mock the signPsbtTransaction function
jest.mock("@/app/common/utils/psbt", () => ({
  signPsbtTransaction: jest.fn(),
}));

describe("utils/delegations/signStakingTx", () => {
  const networks = [Network.MAINNET, Network.SIGNET];
  networks.forEach((n) => {
    const network = toNetwork(n);
    const dataGen = new DataGenerator(network);
    const randomFpKeys = dataGen.generateRandomKeyPair(true);
    const randomUserKeys = dataGen.generateRandomKeyPair(true);
    const feeRate = 1; // keep test simple by setting this to unit 1
    const randomParam = dataGen.generateRandomGlobalParams(true);
    const randomStakingAmount = dataGen.getRandomIntegerBetween(
      randomParam.minStakingAmountSat,
      randomParam.maxStakingAmountSat,
    );
    const randomStakingTimeBlocks = dataGen.getRandomIntegerBetween(
      randomParam.minStakingTimeBlocks,
      randomParam.maxStakingTimeBlocks,
    );
    const randomInputUTXOs = dataGen.generateRandomUTXOs(
      randomStakingAmount + Math.floor(Math.random() * 1000000),
      Math.floor(Math.random() * 10) + 1,
    );
    const txHex = dataGen.generateRandomTxId();

    // mock the btcWallet
    const btcWallet = {
      signPsbt: jest.fn(),
      getWalletProviderName: jest.fn(),
      pushTx: jest.fn().mockResolvedValue(true),
    };

    it("should successfully sign a staking transaction", async () => {
      // Import the mock function
      const { signPsbtTransaction } = require("@/app/common/utils/psbt");
      signPsbtTransaction.mockImplementationOnce(() => {
        return async () => {
          return {
            toHex: () => txHex,
          };
        };
      });

      const result = await signStakingTx(
        btcWallet as any,
        randomParam,
        randomStakingAmount,
        randomStakingTimeBlocks,
        randomFpKeys.publicKey,
        network,
        dataGen.getTaprootAddress(randomUserKeys.publicKey),
        randomUserKeys.publicKey,
        feeRate,
        randomInputUTXOs,
      );

      expect(result).toBeDefined();
      expect(btcWallet.pushTx).toHaveBeenCalled();
      // check the signed transaction hex
      expect(result.stakingTxHex).toBe(txHex);
      // check the staking term
      expect(result.stakingTerm).toBe(randomStakingTimeBlocks);
    });

    it("should throw an error when signing a staking transaction", async () => {
      // Import the mock function
      const { signPsbtTransaction } = require("@/app/common/utils/psbt");
      signPsbtTransaction.mockImplementationOnce(() => {
        return async () => {
          throw new Error("signing error");
        };
      });

      try {
        await signStakingTx(
          btcWallet as any,
          randomParam,
          randomStakingAmount,
          randomStakingTimeBlocks,
          randomFpKeys.publicKey,
          network,
          dataGen.getTaprootAddress(randomUserKeys.publicKey),
          randomUserKeys.publicKey,
          feeRate,
          randomInputUTXOs,
        );
      } catch (error: any) {
        expect(error).toBeDefined();
        expect(error.message).toBe("signing error");
      }
    });
  });
});
