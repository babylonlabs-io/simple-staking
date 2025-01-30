import { getNetworkAppUrl } from "@/config";
import { getCommitHash } from "@/utils/version";

export default function MetaTags() {
  const commitHash = getCommitHash();

  return (
    <>
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta property="og:title" content="Babylon - Staking Dashboard" />
      <meta name="description" content="BTC Staking Dashboard" key="desc" />
      <meta property="og:description" content="BTC Staking Dashboard" />
      <meta property="og:image:type" content="image/png" />
      <meta property="og:image:width" content="2048" />
      <meta property="og:image:height" content="1170" />
      <meta property="og:image" content={`${getNetworkAppUrl()}/og.png`} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content="BTC Staking Dashboard" />
      <meta name="twitter:description" content="BTC Staking Dashboard" />
      <meta name="twitter:image" content={`${getNetworkAppUrl()}/og.png`} />
      <meta name="twitter:image:type" content="image/png" />
      <meta name="twitter:image:width" content="2048" />
      <meta name="twitter:image:height" content="1170" />
      <meta name="version" content={commitHash} />
    </>
  );
}
