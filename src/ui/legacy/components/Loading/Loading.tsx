interface LoadingProps {
  text?: string;
  noBorder?: boolean;
}

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
