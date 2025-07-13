export function WalletNotConnected() {
  return (
    <div className="flex items-center justify-center h-96">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">Connect Your Wallet</h2>
        <p className="text-gray-600">
          Please connect your Babylon wallet to use staking features.
        </p>
      </div>
    </div>
  );
}
