import { RiErrorWarningLine } from "react-icons/ri";

interface TestingInfoProps {}

export const TestingInfo: React.FC<TestingInfoProps> = () => {
  return (
    <div className="flex w-full justify-center">
      <div className="card flex w-full flex-col items-center gap-1 bg-base-200 p-3 text-sm md:w-auto md:flex-row">
        <div className="flex items-center gap-1 md:gap-2">
          <RiErrorWarningLine size={20} />
          <p>
            <strong>Testing app</strong>
          </p>
        </div>
        <p className="text-center lg:text-left">
          No financial service. No real tokens. Use it at your own discretion.
        </p>
      </div>
    </div>
  );
};
