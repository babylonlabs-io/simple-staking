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
      lcdUrl: string;
      rpcUrl: string;
    };
  }
}

interface Infra {
  config: Infra.Config;
}
