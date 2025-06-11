import mempoolJS from "@mempool/mempool.js";

const HTTP_PROTOCOL_REGEX = /^https?:\/\//;
const url = process.env.NEXT_PUBLIC_MEMPOOL_API ?? "https://mempool.space";
const hostname = url.replace(HTTP_PROTOCOL_REGEX, "");

const { bitcoin } = mempoolJS({
  hostname,
  network: process.env.NEXT_PUBLIC_NETWORK ?? "signet",
});

export default bitcoin;
