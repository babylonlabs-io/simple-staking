import mempoolJS from "@mempool/mempool.js";

declare global {
  namespace Infra {
    type BTCClient = ReturnType<typeof mempoolJS>["bitcoin"];
  }

  interface Infra {
    bitcoin: Infra.BTCClient;
  }
}
