import { Message } from "./Message";
import stakingNotStartedIcon from "./staking-not-started.svg";

export const StakingNotAvailable = () => {
  return (
    <Message
      title="Staking Temporarily Unavailable"
      message={`Staking is not enabled at this time.
      Please check back later.`}
      icon={stakingNotStartedIcon}
    />
  );
};
