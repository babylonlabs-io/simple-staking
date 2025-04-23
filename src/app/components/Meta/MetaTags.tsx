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
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image" content={"/website-preview-image.png"} />
      <meta property="og:url" content="https://babylon.stake.fish" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content="BTC Staking Dashboard" />
      <meta name="twitter:description" content="BTC Staking Dashboard" />
      <meta name="twitter:image:type" content="image/png" />
      <meta name="twitter:image:width" content="1200" />
      <meta name="twitter:image:height" content="630" />
      <meta name="twitter:image" content={"/website-preview-image.png"}></meta>
      <link rel="icon" href="/favicon.ico" />
      <link
        rel="apple-touch-icon"
        sizes="180x180"
        href="/apple-touch-icon.png"
      />
      <link
        rel="icon"
        type="image/png"
        sizes="32x32"
        href="/favicon-32x32.png"
      />
      <link
        rel="icon"
        type="image/png"
        sizes="16x16"
        href="/favicon-16x16.png"
      />
      <meta name="version" content={commitHash} />
    </>
  );
}
