interface LoadingProps { }

export const LoadingView: React.FC<LoadingProps> = () => {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 rounded-2xl border border-neutral-content py-4 dark:border-neutral-content/20">
      <span className="loading loading-spinner loading-lg text-primary" />
      <p>Please wait...</p>
    </div>
  );
};

export const LoadingTableList: React.FC<LoadingProps> = () => {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 py-2">
      <span className="loading loading-spinner loading-lg text-primary" />
      <p>Please wait...</p>
    </div>
  );
};