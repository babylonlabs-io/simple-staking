import { RiErrorWarningLine } from "react-icons/ri";

interface TestingInfoProps {}

export const TestingInfo: React.FC<TestingInfoProps> = () => {
  return (
    <div className="flex w-full justify-center hidden">
      <div className="card flex w-full flex-col items-center gap-1 bg-base-200 p-3 text-sm lg:w-auto lg:flex-row lg:text-xs">
        <div className="flex items-center gap-1 lg:gap-2">
          <RiErrorWarningLine size={20} />
          <p className="whitespace-nowrap text-center">
            <strong>This is a testing Dapp.</strong>
          </p>
        </div>
        <p className="text-center lg:text-left">
          The app may contain bugs. Use it after conducting your own research
          and making an informed decision. Tokens are for testing only and do
          not carry any monetary value.
        </p>
      </div>
    </div>
  );
};
