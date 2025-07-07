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
      rpc: string;
    };
  }
}

interface Infra {
  config: Infra.Config;
}
