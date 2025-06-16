import mempoolJS from "@mempool/mempool.js";

const HTTP_PROTOCOL_REGEX = /^https?:\/\//;

export default ({ config }: DI.Container) => {
  const { bitcoin } = mempoolJS({
    hostname: config.bitcoin.url.replace(HTTP_PROTOCOL_REGEX, ""),
    network: config.bitcoin.network,
  });

  return bitcoin;
};
