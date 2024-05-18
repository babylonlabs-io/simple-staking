interface LoadingProps {}

// Wallet is connected but we are still loading the staking params
export const Loading: React.FC<LoadingProps> = () => {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 rounded-2xl border border-neutral-content py-4 dark:border-neutral-content/20">
      <span className="loading loading-spinner loading-lg text-primary" />
      <p>Please wait...</p>
    </div>
  );
};
