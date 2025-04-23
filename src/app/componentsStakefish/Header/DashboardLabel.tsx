import { cx } from "class-variance-authority";

import { Button } from "@/ui";
import { getLinkProps } from "@/utils/stakefish";

export const DashboardLabel = ({ className }: { className?: string }) => {
  return (
    <Button
      variant="text"
      {...getLinkProps("/")}
      href="/"
      className={cx("!no-underline", className)}
    >
      <div className="flex items-center gap-1.5">
        <span
          className={cx(
            "capitalize text-desktopCallout underline-offset-1",
            "underline",
          )}
        >
          Dashboard
        </span>
      </div>
    </Button>
  );
};
