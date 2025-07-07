import {
  BabylonClient,
  type BabylonClientConfig,
} from "@babylonlabs-io/babylon-proto-ts";

export default ({ config }: DI.Container) => {
  const babylonConfig: BabylonClientConfig = {
    rpc: config.babylon.rpc,
  };

  // Create read-only client for queries
  const createBabylonClient = async (): Promise<BabylonClient> => {
    return await BabylonClient.connect(babylonConfig);
  };

  return {
    createBabylonClient,
    config: babylonConfig,
  };
};
