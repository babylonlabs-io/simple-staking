interface StepsProps {
  isWalletConnected: boolean;
  isAmountSet: boolean;
  isDurationSet: boolean;
  isFinalityProviderSet: boolean;
}

export const Steps: React.FC<StepsProps> = ({
  isWalletConnected,
  isAmountSet,
  isDurationSet,
  isFinalityProviderSet,
}) => {
  return (
    <div className="flex justify-center">
      <ul className="steps text-sm">
        <li
          className={`step ${isWalletConnected && "step-neutral"}`}
          data-content="💳"
        >
          Wallet
        </li>
        <li
          className={`step ${isAmountSet && "step-neutral"}`}
          data-content="💰"
        >
          Amount
        </li>
        <li
          className={`step ${isDurationSet && "step-neutral"}`}
          data-content="⏳"
        >
          Duration
        </li>
        <li
          className={`step ${isFinalityProviderSet && "step-neutral"}`}
          data-content="👤"
        >
          Finality provider
        </li>
      </ul>
    </div>
  );
};
