import { GlobalParamsVersion } from "@/app/types/globalParams";
import { getCurrentGlobalParamsVersion } from "@/utils/globalParams";

import { testingNetworks } from "../helper";

describe("globalParams", () => {
  const { dataGenerator } = testingNetworks[0];
  let globalParams: GlobalParamsVersion[];
  let lastActivationHeight: number;
  let firstActivationHeight: number;

  beforeEach(() => {
    globalParams = dataGenerator.generateGlobalPramsVersions(
      dataGenerator.getRandomIntegerBetween(1, 100),
    );
    lastActivationHeight =
      globalParams[globalParams.length - 1].activationHeight;
    firstActivationHeight = globalParams[0].activationHeight;
  });

  it("should not modify the original globalParams array", () => {
    const clonedGlobalParams = [...globalParams];
    getCurrentGlobalParamsVersion(0, globalParams);
    expect(globalParams).toEqual(clonedGlobalParams);
  });

  it("should get the correct currentVersion global param", () => {
    const randomHeight = dataGenerator.getRandomIntegerBetween(
      firstActivationHeight,
      lastActivationHeight + 1,
    );
    const clonedGlobalParams = [...globalParams];
    const { currentVersion } = getCurrentGlobalParamsVersion(
      randomHeight,
      globalParams,
    );
    const expected = clonedGlobalParams
      .sort((a, b) => b.activationHeight - a.activationHeight)
      .find((v) => v.activationHeight <= randomHeight);
    expect(currentVersion).toEqual(expected);
  });

  it("should return undefined currentVersion if the height is lower than the first version", () => {
    const randomHeight = dataGenerator.getRandomIntegerBetween(
      0,
      firstActivationHeight - 1,
    );
    const {
      currentVersion,
      nextVersion,
      isApprochingNextVersion,
      firstActivationHeight: firstHeight,
    } = getCurrentGlobalParamsVersion(randomHeight, globalParams);
    expect(currentVersion).toBeUndefined();
    expect(nextVersion).toBeUndefined();
    expect(isApprochingNextVersion).toBeFalsy();
    expect(firstHeight).toEqual(firstActivationHeight);
  });

  it("should return correct values before next activation height", () => {
    const param = globalParams[0];
    let approachingHeight = param.activationHeight - 1;
    let result = getCurrentGlobalParamsVersion(approachingHeight, globalParams);
    expect(result.currentVersion).toBeUndefined();
    expect(result.nextVersion).toBeUndefined();
    expect(result.isApprochingNextVersion).toBeFalsy();
    // after passed the first activation height
    result = getCurrentGlobalParamsVersion(
      param.activationHeight,
      globalParams,
    );
    expect(result.currentVersion).toEqual(param);
    expect(result.nextVersion).toEqual(globalParams[1]);
    expect(result.isApprochingNextVersion).toBeFalsy();
  });

  it("should return correct values after the last activation height", () => {
    const lastParamIndex = globalParams.length - 1;
    const param = globalParams[lastParamIndex];
    // last version
    const lastConfirmationDepth =
      globalParams[lastParamIndex - 1].confirmationDepth;
    // before approaching
    let approachingHeight = param.activationHeight - lastConfirmationDepth - 1;
    let result = getCurrentGlobalParamsVersion(approachingHeight, globalParams);
    expect(result.currentVersion).toEqual(globalParams[lastParamIndex - 1]);
    expect(result.nextVersion).toEqual(param);
    expect(result.isApprochingNextVersion).toBeFalsy();
    // approaching
    approachingHeight = param.activationHeight - lastConfirmationDepth;
    result = getCurrentGlobalParamsVersion(approachingHeight, globalParams);
    expect(result.currentVersion).toEqual(globalParams[lastParamIndex - 1]);
    expect(result.nextVersion).toEqual(param);
    expect(result.isApprochingNextVersion).toBeTruthy();
    // after approaching
    result = getCurrentGlobalParamsVersion(
      param.activationHeight,
      globalParams,
    );
    expect(result.currentVersion).toEqual(param);
    expect(result.nextVersion).toBeUndefined();
    expect(result.isApprochingNextVersion).toBeFalsy();
  });

  it("should return correct values for params version that are not first or last", () => {
    for (let index = 1; index < globalParams.length - 2; index++) {
      const param = globalParams[index];
      // before approaching
      const lastConfirmationDepth = globalParams[index - 1].confirmationDepth;
      // before approaching
      let approachingHeight =
        param.activationHeight - lastConfirmationDepth - 1;
      let result = getCurrentGlobalParamsVersion(
        approachingHeight,
        globalParams,
      );
      expect(result.currentVersion).toEqual(globalParams[index - 1]);
      expect(result.nextVersion).toEqual(param);
      expect(result.isApprochingNextVersion).toBeFalsy();
      // approaching
      approachingHeight = param.activationHeight - lastConfirmationDepth;
      result = getCurrentGlobalParamsVersion(approachingHeight, globalParams);
      expect(result.currentVersion).toEqual(globalParams[index - 1]);
      expect(result.nextVersion).toEqual(param);
      expect(result.isApprochingNextVersion).toBeTruthy();
      // after approaching
      result = getCurrentGlobalParamsVersion(
        param.activationHeight,
        globalParams,
      );
      expect(result.currentVersion).toEqual(param);
      expect(result.nextVersion).toEqual(globalParams[index + 1]);
      expect(result.isApprochingNextVersion).toBeFalsy();
    }
  });
});
