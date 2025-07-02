export const getCommitHash = () => {
  return process.env.NEXT_PUBLIC_COMMIT_HASH || "development";
};
