import { twJoin } from "tailwind-merge";

import { Logo } from "../Logo/Logo";

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
        <div className="container h-20 py-6 px-4 md:px-6 mx-auto flex items-center justify-between">
          <Logo />
        </div>
      </section>
    </nav>
  );
};
