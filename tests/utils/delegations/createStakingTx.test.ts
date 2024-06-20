import { createStakingTx } from "@/utils/delegations/signStakingTx";
import { toNetwork } from "@/utils/wallet";
import { Network } from "@/utils/wallet/wallet_provider";

import { DataGenerator } from "../../helper";

describe("utils/delegations/createStakingTx", () => {
  const networks = [Network.MAINNET, Network.SIGNET];
  networks.forEach((n) => {
    const network = toNetwork(n);
    const dataGen = new DataGenerator(network);
    const randomFpKeys = dataGen.generateRandomKeyPair(true);
    const randomUserKeys = dataGen.generateRandomKeyPair(true);
    const feeRate = 1; // keep test simple by setting this to unit 1

    [true, false].forEach((isFixed) => {
      const randomParam = dataGen.generateRandomGlobalParams(isFixed);
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
      const testTermDescription = isFixed ? "fixed term" : "variable term";

      it("should successfully create a staking transaction", () => {
        const { stakingFeeSat, stakingTerm, unsignedStakingPsbt } =
          createStakingTx(
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

        expect(stakingTerm).toBe(randomStakingTimeBlocks);
        const matchedStakingOutput = unsignedStakingPsbt.txOutputs.find(
          (output) => {
            return output.value === randomStakingAmount;
          },
        );
        expect(matchedStakingOutput).toBeDefined();
        expect(stakingFeeSat).toBeGreaterThan(0);
      });

      it(`${testTermDescription} - should successfully create a staking transaction with change amount in output`, () => {
        const utxo = dataGen.generateRandomUTXOs(
          randomStakingAmount + Math.floor(Math.random() * 1000000),
          1, // make it a single utxo so we always have change
        );
        const { stakingFeeSat, stakingTerm, unsignedStakingPsbt } =
          createStakingTx(
            randomParam,
            randomStakingAmount,
            randomStakingTimeBlocks,
            randomFpKeys.publicKey,
            network,
            dataGen.getTaprootAddress(randomUserKeys.publicKey),
            randomUserKeys.publicKey,
            feeRate,
            utxo,
          );

        expect(stakingTerm).toBe(randomStakingTimeBlocks);
        const matchedStakingOutput = unsignedStakingPsbt.txOutputs.find(
          (output) => {
            return output.value === randomStakingAmount;
          },
        );
        expect(matchedStakingOutput).toBeDefined();
        expect(stakingFeeSat).toBeGreaterThan(0);

        const changeOutput = unsignedStakingPsbt.txOutputs.find((output) => {
          return (
            output.address ==
            dataGen.getTaprootAddress(randomUserKeys.publicKey)
          );
        });
        expect(changeOutput).toBeDefined();
      });

      it(`${testTermDescription} - should throw an error if the staking amount is less than the minimum staking amount`, () => {
        expect(() =>
          createStakingTx(
            randomParam,
            randomParam.minStakingAmountSat - 1,
            randomStakingTimeBlocks,
            randomFpKeys.publicKey,
            network,
            dataGen.getTaprootAddress(randomUserKeys.publicKey),
            randomUserKeys.publicKey,
            feeRate,
            randomInputUTXOs,
          ),
        ).toThrow("Invalid staking data");
      });

      it(`${testTermDescription} - should throw an error if the staking amount is greater than the maximum staking amount`, () => {
        expect(() =>
          createStakingTx(
            randomParam,
            randomParam.maxStakingAmountSat + 1,
            randomStakingTimeBlocks,
            randomFpKeys.publicKey,
            network,
            dataGen.getTaprootAddress(randomUserKeys.publicKey),
            randomUserKeys.publicKey,
            feeRate,
            randomInputUTXOs,
          ),
        ).toThrow("Invalid staking data");
      });

      it(`${testTermDescription} - should throw an error if the fee rate is less than or equal to 0`, () => {
        expect(() =>
          createStakingTx(
            randomParam,
            randomStakingAmount,
            randomStakingTimeBlocks,
            randomFpKeys.publicKey,
            network,
            dataGen.getTaprootAddress(randomUserKeys.publicKey),
            randomUserKeys.publicKey,
            0,
            randomInputUTXOs,
          ),
        ).toThrow("Invalid fee rate");
      });

      it(`${testTermDescription} - should throw an error if there are no usable balance`, () => {
        expect(() =>
          createStakingTx(
            randomParam,
            randomStakingAmount,
            randomStakingTimeBlocks,
            randomFpKeys.publicKey,
            network,
            dataGen.getTaprootAddress(randomUserKeys.publicKey),
            randomUserKeys.publicKey,
            feeRate,
            [],
          ),
        ).toThrow("Not enough usable balance");
      });

      // This test only test createStakingTx when apiDataToStakingScripts throw error.
      // The different error cases are tested in the apiDataToStakingScripts.test.ts
      it(`${testTermDescription} - should throw an error if the staking scripts cannot be built`, () => {
        expect(() =>
          createStakingTx(
            randomParam,
            randomStakingAmount,
            randomStakingTimeBlocks,
            dataGen.generateRandomKeyPair(false).publicKey, // invalid finality provider key
            network,
            dataGen.getTaprootAddress(randomUserKeys.publicKey),
            randomUserKeys.publicKey,
            feeRate,
            randomInputUTXOs,
          ),
        ).toThrow("Invalid script data provided");
      });

      // More test cases when we have variable staking terms
      if (!isFixed) {
        it(`${testTermDescription} - should throw an error if the staking term is less than the minimum staking time blocks`, () => {
          expect(() =>
            createStakingTx(
              randomParam,
              randomStakingAmount,
              randomParam.minStakingTimeBlocks - 1,
              randomFpKeys.publicKey,
              network,
              dataGen.getTaprootAddress(randomUserKeys.publicKey),
              randomUserKeys.publicKey,
              feeRate,
              randomInputUTXOs,
            ),
          ).toThrow("Invalid staking data");
        });

        it(`${testTermDescription} - should throw an error if the staking term is greater than the maximum staking time blocks`, () => {
          expect(() =>
            createStakingTx(
              randomParam,
              randomStakingAmount,
              randomParam.maxStakingTimeBlocks + 1,
              randomFpKeys.publicKey,
              network,
              dataGen.getTaprootAddress(randomUserKeys.publicKey),
              randomUserKeys.publicKey,
              feeRate,
              randomInputUTXOs,
            ),
          ).toThrow("Invalid staking data");
        });
      }
    });
  });
});
