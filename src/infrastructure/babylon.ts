import { createBabylonSDK } from "@babylonlabs-io/babylon-proto-ts";

export default ({ config }: DI.Container) => {
  const babylonSDK = createBabylonSDK({ rpcUrl: config.babylon.rpc });

  return {
    babylonSDK,
  };
};
