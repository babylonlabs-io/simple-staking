import { twJoin } from "tailwind-merge";

import { shouldDisplayTestingMsg } from "@/config";

import { Logo } from "../Logo/Logo";
import { TestingInfo } from "../TestingInfo/TestingInfo";

export const SimplifiedHeader = ({
  isMinimal = false,
}: {
  isMinimal?: boolean;
}) => {
  return (
    <nav className="w-full">
      <section
        className={twJoin(
          "bg-primary-main w-full",
          isMinimal ? "h-[84px]" : "h-[300px]",
        )}
      >
        <div className="container h-20 py-6 px-6 mx-auto flex items-center justify-between">
          <Logo />
          <div className="flex flex-1">
            {shouldDisplayTestingMsg() && (
              <div className="hidden flex-1 xl:flex">
                <TestingInfo />
              </div>
            )}
          </div>
        </div>
        {shouldDisplayTestingMsg() && (
          <div className="container mx-auto flex w-full items-center p-6 pb-0 xl:hidden">
            <TestingInfo />
          </div>
        )}
      </section>
    </nav>
  );
};
