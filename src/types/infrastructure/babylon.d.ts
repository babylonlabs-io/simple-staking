// TODO: Create and export types from babylon-proto-ts
import { createBabylonSDK } from "@babylonlabs-io/babylon-proto-ts";

declare global {
  namespace Infra {
    type BabylonSDK = ReturnType<typeof createBabylonSDK>;
  }

  interface Infra {
    bitcoin: Infra.BabylonSDK;
  }
}
