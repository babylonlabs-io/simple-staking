import * as bitcoin from "bitcoinjs-lib";

import { apiDataToStakingScripts } from "@/utils/apiDataToStakingScripts";

import { DataGenerator } from "../helper";

describe("apiDataToStakingScripts", () => {
  const dataGen = new DataGenerator(bitcoin.networks.testnet);
  it("should throw an error if the publicKeyNoCoord is not set", () => {
    const { noCoordPublicKey: finalityProviderPk } =
      dataGen.generateRandomKeyPair();
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
});
