import { twJoin } from "tailwind-merge";

import { Container } from "../Container/Container";
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
        <Container className="h-20 p-6 flex items-center justify-between">
          <Logo />
        </Container>
      </section>
    </nav>
  );
};
