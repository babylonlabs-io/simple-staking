export const getCommitHash = () => {
  try {
    return process.env.NEXT_PUBLIC_COMMIT_HASH || "development";
  } catch {
    return "development";
  }
};
