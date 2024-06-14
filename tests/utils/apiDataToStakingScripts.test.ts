/**
 * @jest-environment node
 */
import * as bitcoin from "bitcoinjs-lib";

import { apiDataToStakingScripts } from "@/utils/apiDataToStakingScripts";

import { DataGenerator } from "../helper";

describe("apiDataToStakingScripts", () => {
  const dataGen = new DataGenerator(bitcoin.networks.testnet);
  it("should throw an error if the publicKeyNoCoord is not set", () => {
    const { publicKey: finalityProviderPk } = dataGen.generateRandomKeyPairs();
    const stakingTxTimelock = dataGen.generateRandomStakingTerm();
    const globalParams = dataGen.generateRandomGlobalParams();
    expect(() => {
      apiDataToStakingScripts(
        finalityProviderPk,
        stakingTxTimelock,
        globalParams,
        "",
      );
    }).toThrow("Invalid data");
  });
  // it("should throw an error if the stakingScriptData cannot be built", () => {
  //   // mock the new StakingScriptData to throw an error
  //   jest.mock("btc-staking-ts", () => {
  //     return {
  //       StakingScriptData: jest.fn().mockImplementation(() => {
  //         throw new Error("Cannot build staking script data");
  //       }),
  //     };
  //   });
  //   const { publicKey: finalityProviderPk } = dataGen.generateRandomKeyPairs();
  //   const stakingTxTimelock = dataGen.generateRandomStakingTerm();
  //   const globalParams = dataGen.generateRandomGlobalParams();
  //   const publicKeyNoCoord = dataGen.generateRandomKeyPairs().publicKey;
  //   expect(() => {
  //     apiDataToStakingScripts(
  //       finalityProviderPk,
  //       stakingTxTimelock,
  //       globalParams,
  //       publicKeyNoCoord,
  //     );
  //   }).toThrow("Cannot build staking script data");
  // });
  // it("should throw an error if the scripts cannot be built", () => {
  //   // TODO
  // });
  // it("should return the scripts", () => {
  //   // TODO
  // });
});
