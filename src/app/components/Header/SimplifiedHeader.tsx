import { shouldDisplayTestingMsg } from "@/config";

import { Logo } from "../Logo/Logo";
import { TestingInfo } from "../TestingInfo/TestingInfo";

export const SimplifiedHeader = () => {
  return (
    <nav>
      <section className="bg-primary-main dark:bg-[#181818] h-[300px] mb-[-188px]">
        <div className="container h-[84px] py-[22px] px-6 mx-auto flex items-center justify-between">
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
