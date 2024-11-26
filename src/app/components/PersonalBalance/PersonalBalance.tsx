import { Heading } from "@babylonlabs-io/bbn-core-ui";

import { StatItem } from "../Stats/StatItem";

export function PersonalBalance() {
  return (
    <div className="flex flex-col gap-4 p-1 xl:justify-between mb-12">
      <Heading variant="h5" className="text-primary-dark md:text-4xl">
        Wallet Balance
      </Heading>
      <div className="flex flex-col justify-between bg-secondary-contrast rounded p-6 text-base md:flex-row">
        <StatItem loading={false} title="Bitcoin Balance" value="100.134 BTC" />

        <div className="divider mx-0 my-2 md:divider-horizontal" />

        <StatItem loading={false} title="Stakable Bitcoin" value="0.134 BTC" />

        <div className="divider mx-0 my-2 md:divider-horizontal" />

        <StatItem loading={false} title="Babylon Balance" value="100.134 BBN" />

        <div className="divider mx-0 my-2 md:divider-horizontal" />

        <StatItem loading={false} title="BBN Rewards" value="0.134 BBN" />
      </div>
    </div>
  );
}
