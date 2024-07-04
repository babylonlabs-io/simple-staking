import { Psbt, Transaction } from "bitcoinjs-lib";
import { initBTCCurve } from "btc-staking-ts";

import { signUnbondingTx } from "@/utils/delegations/signUnbondingTx";

import { testingNetworks } from "../../helper";

jest.mock("@/app/api/getUnbondingEligibility", () => ({
  getUnbondingEligibility: jest.fn(),
}));
jest.mock("@/app/api/getGlobalParams", () => ({
  getGlobalParams: jest.fn(),
}));
jest.mock("@/app/api/postUnbonding", () => ({
  postUnbonding: jest.fn(),
}));

describe("signUnbondingTx", () => {
  initBTCCurve();
  const { network, dataGenerator } = testingNetworks[0];
  const randomTxId = dataGenerator.generateRandomTxId();
  const randomGlobalParamsVersions = dataGenerator.generateGlobalPramsVersions(
    dataGenerator.getRandomIntegerBetween(1, 20),
  );
  const stakerKeys = dataGenerator.generateRandomKeyPair();
  const randomStakingTxHeight =
    randomGlobalParamsVersions[
      dataGenerator.getRandomIntegerBetween(
        0,
        randomGlobalParamsVersions.length - 1,
      )
    ].activationHeight + 1;
  const { signedPsbt } = dataGenerator.createRandomStakingPsbt(
    randomGlobalParamsVersions,
    randomStakingTxHeight,
    stakerKeys,
  );

  const signedPsbtTx = signedPsbt.extractTransaction();

  const mockedDelegationApi = [
    {
      stakingTxHashHex: randomTxId,
      finalityProviderPkHex:
        dataGenerator.generateRandomKeyPair().noCoordPublicKey,
      stakingTx: {
        startHeight: randomStakingTxHeight,
        timelock: signedPsbtTx.locktime,
        txHex: signedPsbtTx.toHex(),
        outputIndex: 0,
      },
    },
  ] as any;
  const mockedSignPsbtTx = jest
    .fn()
    .mockImplementation(async (psbtHex: string) => {
      const psbt = Psbt.fromHex(psbtHex);
      return psbt
        .signAllInputs(stakerKeys.keyPair)
        .finalizeAllInputs()
        .extractTransaction();
    });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should throw an error if no back-end API data is available", async () => {
    expect(
      signUnbondingTx(
        randomTxId,
        [],
        stakerKeys.noCoordPublicKey,
        network,
        mockedSignPsbtTx,
      ),
    ).rejects.toThrow("Delegation not found");
  });

  it("should throw an error if txId not found in delegationApi", async () => {
    const delegationApi = [
      { stakingTxHashHex: dataGenerator.generateRandomTxId() },
    ] as any;
    expect(
      signUnbondingTx(
        randomTxId,
        delegationApi,
        stakerKeys.noCoordPublicKey,
        network,
        mockedSignPsbtTx,
      ),
    ).rejects.toThrow("Delegation not found");
  });

  it("should throw an error if the stakingTx is not eligible for unbonding", async () => {
    const {
      getUnbondingEligibility,
    } = require("@/app/api/getUnbondingEligibility");
    getUnbondingEligibility.mockImplementationOnce(async () => {
      return false;
    });

    expect(
      signUnbondingTx(
        randomTxId,
        mockedDelegationApi,
        stakerKeys.noCoordPublicKey,
        network,
        mockedSignPsbtTx,
      ),
    ).rejects.toThrow("Not eligible for unbonding");
  });

  it("should throw an error if global param is not loaded", async () => {
    const {
      getUnbondingEligibility,
    } = require("@/app/api/getUnbondingEligibility");
    getUnbondingEligibility.mockImplementationOnce(async () => {
      return true;
    });

    const { getGlobalParams } = require("@/app/api/getGlobalParams");
    getGlobalParams.mockImplementationOnce(async () => {
      return [];
    });

    expect(
      signUnbondingTx(
        randomTxId,
        mockedDelegationApi,
        stakerKeys.noCoordPublicKey,
        network,
        mockedSignPsbtTx,
      ),
    ).rejects.toThrow("No global params versions found");
  });

  it("should throw an error if the current version is not found", async () => {
    const {
      getUnbondingEligibility,
    } = require("@/app/api/getUnbondingEligibility");
    getUnbondingEligibility.mockImplementationOnce(async () => {
      return true;
    });

    const { getGlobalParams } = require("@/app/api/getGlobalParams");
    getGlobalParams.mockImplementationOnce(async () => {
      return randomGlobalParamsVersions;
    });

    const firstVersion = randomGlobalParamsVersions[0];
    const delegationApi = [
      {
        stakingTxHashHex: randomTxId,
        stakingTx: {
          // Make height lower than the first version
          activationHeight: firstVersion.activationHeight - 1,
        },
      },
    ] as any;
    expect(
      signUnbondingTx(
        randomTxId,
        delegationApi,
        stakerKeys.noCoordPublicKey,
        network,
        mockedSignPsbtTx,
      ),
    ).rejects.toThrow("Current version not found");
  });

  it("should throw error if fail to signPsbtTx", async () => {
    const {
      getUnbondingEligibility,
    } = require("@/app/api/getUnbondingEligibility");
    getUnbondingEligibility.mockImplementationOnce(async () => {
      return true;
    });

    const { getGlobalParams } = require("@/app/api/getGlobalParams");
    getGlobalParams.mockImplementationOnce(async () => {
      return randomGlobalParamsVersions;
    });

    mockedSignPsbtTx.mockRejectedValueOnce(new Error("oops!"));

    expect(
      signUnbondingTx(
        randomTxId,
        mockedDelegationApi,
        stakerKeys.noCoordPublicKey,
        network,
        mockedSignPsbtTx,
      ),
    ).rejects.toThrow("Failed to sign PSBT for the unbonding transaction");
  });

  it("should return the signed unbonding transaction", async () => {
    const {
      getUnbondingEligibility,
    } = require("@/app/api/getUnbondingEligibility");
    getUnbondingEligibility.mockImplementationOnce(async () => {
      return true;
    });

    const { getGlobalParams } = require("@/app/api/getGlobalParams");
    getGlobalParams.mockImplementationOnce(async () => {
      return randomGlobalParamsVersions;
    });

    const { postUnbonding } = require("@/app/api/postUnbonding");
    postUnbonding.mockImplementationOnce(async () => {
      return;
    });

    const { unbondingTxHex, delegation } = await signUnbondingTx(
      randomTxId,
      mockedDelegationApi,
      stakerKeys.noCoordPublicKey,
      network,
      mockedSignPsbtTx,
    );
    const unbondingTx = Transaction.fromHex(unbondingTxHex);
    const sig = unbondingTx.ins[0].witness[0].toString("hex");
    const unbondingTxId = unbondingTx.getId();
    expect(postUnbonding).toHaveBeenCalledWith(
      sig,
      delegation.stakingTxHashHex,
      unbondingTxId,
      unbondingTxHex,
    );
  });
});
