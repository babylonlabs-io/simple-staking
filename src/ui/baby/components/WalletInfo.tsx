interface WalletInfoProps {
  bech32Address: string;
  delegationsCount: number;
  totalStaked: number;
  totalRewards: number;
  validatorsCount: number;
}

export function WalletInfo({
  bech32Address,
  delegationsCount,
  totalStaked,
  totalRewards,
  validatorsCount,
}: WalletInfoProps) {
  return (
    <div className="bg-secondary-highlight text-accent-primary p-6 rounded mb-6">
      <h2 className="text-xl font-semibold mb-4">Wallet Info</h2>
      <p className="text-sm text-gray-600 mb-2">Address: {bech32Address}</p>
      <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <p className="text-sm font-medium">Active Delegations</p>
          <p className="text-lg font-bold">{delegationsCount}</p>
        </div>
        <div>
          <p className="text-sm font-medium">Total Staked</p>
          <p className="text-lg font-bold">
            {totalStaked.toLocaleString()} tBABY
          </p>
        </div>
        <div>
          <p className="text-sm font-medium">Total Rewards</p>
          <p className="text-lg font-bold text-green-600">
            {totalRewards.toLocaleString()} tBABY
          </p>
        </div>
        <div>
          <p className="text-sm font-medium">Available Validators</p>
          <p className="text-lg font-bold">{validatorsCount}</p>
        </div>
      </div>
    </div>
  );
}
