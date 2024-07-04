import { txFeeSafetyCheck } from "@/utils/delegations/fee";

import { testingNetworks } from "../../helper";

describe("txFeeSafetyCheck", () => {
  testingNetworks.map(({ networkName, dataGenerator }) => {
    const feeRate = dataGenerator.generateRandomFeeRates();
    const globalParams = dataGenerator.generateGlobalPramsVersions(
      dataGenerator.getRandomIntegerBetween(1, 10),
    );
    const randomParam =
      globalParams[
        dataGenerator.getRandomIntegerBetween(0, globalParams.length - 1)
      ];
    const { signedPsbt } = dataGenerator.createRandomStakingPsbt(
      globalParams,
      randomParam.activationHeight + 1,
    );
    const tx = signedPsbt.extractTransaction();
    describe(`on ${networkName} - `, () => {
      test("should not throw an error if the estimated fee is within the acceptable range", () => {
        let estimatedFee = (tx.virtualSize() * feeRate) / 2 + 1;
        expect(() => {
          txFeeSafetyCheck(tx, feeRate, estimatedFee);
        }).not.toThrow();

        estimatedFee = tx.virtualSize() * feeRate * 2 - 1;
        expect(() => {
          txFeeSafetyCheck(tx, feeRate, estimatedFee);
        }).not.toThrow();
      });

      test("should throw an error if the estimated fee is too high", () => {
        const estimatedFee = tx.virtualSize() * feeRate * 2 + 1;

        expect(() => {
          txFeeSafetyCheck(tx, feeRate, estimatedFee);
        }).toThrow("Estimated fee is too high");
      });

      test("should throw an error if the estimated fee is too low", () => {
        const estimatedFee = (tx.virtualSize() * feeRate) / 2 - 1;

        expect(() => {
          txFeeSafetyCheck(tx, feeRate, estimatedFee);
        }).toThrow("Estimated fee is too low");
      });

      test("should not throw an error if the estimated fee is exactly within the boundary", () => {
        let estimatedFee = (tx.virtualSize() * feeRate) / 2;
        expect(() => {
          txFeeSafetyCheck(tx, feeRate, estimatedFee);
        }).not.toThrow();

        estimatedFee = tx.virtualSize() * feeRate * 2;
        expect(() => {
          txFeeSafetyCheck(tx, feeRate, estimatedFee);
        }).not.toThrow();
      });
    });
  });
});
