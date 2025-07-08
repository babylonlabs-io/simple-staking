namespace Infra {
  interface Config {
    api: {
      baseUrl: string;
    };
    bitcoin: {
      url: string;
      network: string;
    };
    babylon: {
      rpcUrl: string;
    };
  }
}

interface Infra {
  config: Infra.Config;
}
