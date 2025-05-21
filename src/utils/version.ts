export const getCommitHash = () => {
  return import.meta.env.VITE_COMMIT_HASH || "development";
};
