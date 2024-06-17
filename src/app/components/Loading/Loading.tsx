interface LoadingProps {
  text?: string;
}

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

export const LoadingSmall: React.FC<LoadingProps> = ({ text }) => {
  return (
    <div className="flex items-center justify-center gap-4">
      <p>{text || "Please wait..."}</p>
      <span className="loading loading-spinner loading-xs text-primary" />
    </div>
  );
};
