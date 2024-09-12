jest.mock("@/app/common/utils/psbt", () => ({
  signPsbtTransaction: jest.fn(),
}));
jest.mock("@/utils/delegations/fee", () => ({
  txFeeSafetyCheck: jest.fn().mockReturnValue(undefined),
}));

import { signPsbtTransaction } from "@/app/common/utils/psbt";
import { signStakingTx } from "@/utils/delegations/signStakingTx";

import { DEFAULT_TEST_FEE_RATE, testingNetworks } from "../../helper";

describe.each(testingNetworks)(
  "txFeeSafetyCheck",
  ({ network, dataGenerator: dataGen }) => {
    const randomFpKeys = dataGen.generateRandomKeyPair();
    const randomUserKeys = dataGen.generateRandomKeyPair();
    const randomParam = dataGen.generateRandomGlobalParams(true);
    const randomStakingAmount = dataGen.getRandomIntegerBetween(
      randomParam.minStakingAmountSat,
      randomParam.maxStakingAmountSat,
    );
    const randomStakingTimeBlocks = dataGen.getRandomIntegerBetween(
      randomParam.minStakingTimeBlocks,
      randomParam.maxStakingTimeBlocks,
    );
    const { address: randomTaprootAddress, scriptPubKey } =
      dataGen.getAddressAndScriptPubKey(
        dataGen.generateRandomKeyPair().publicKey,
      ).taproot;
    const randomInputUTXOs = dataGen.generateRandomUTXOs(
      randomStakingAmount + Math.floor(Math.random() * 100000000),
      Math.floor(Math.random() * 10) + 1,
      scriptPubKey,
    );
    const txHex = dataGen.generateRandomTxId();
    const btcWallet = {
      signPsbt: jest.fn(),
      getWalletProviderName: jest.fn(),
      pushTx: jest.fn().mockResolvedValue(true),
    };

    it("should successfully sign a staking transaction", async () => {
      (signPsbtTransaction as any).mockImplementationOnce(() => async () => ({
        toHex: () => txHex,
      }));

      const result = await signStakingTx(
        btcWallet as any,
        randomParam,
        randomStakingAmount,
        randomStakingTimeBlocks,
        randomFpKeys.noCoordPublicKey,
        network,
        randomTaprootAddress,
        randomUserKeys.noCoordPublicKey,
        DEFAULT_TEST_FEE_RATE,
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
      (signPsbtTransaction as any).mockImplementationOnce(() => async () => {
        throw new Error("signing error");
      });

      try {
        await signStakingTx(
          btcWallet as any,
          randomParam,
          randomStakingAmount,
          randomStakingTimeBlocks,
          randomFpKeys.noCoordPublicKey,
          network,
          randomTaprootAddress,
          randomUserKeys.noCoordPublicKey,
          DEFAULT_TEST_FEE_RATE,
          randomInputUTXOs,
        );
      } catch (error: any) {
        expect(error).toBeDefined();
        expect(error.message).toBe("signing error");
      }
    });
  },
);
