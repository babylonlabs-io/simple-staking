import { AiOutlinePlus } from "react-icons/ai";
import { twJoin } from "tailwind-merge";

interface CounterButtonProps {
  counter: number;
  max: number;
  onAdd: () => void;
  alwaysShowCounter?: boolean;
}

export function CounterButton({
  counter,
  max,
  onAdd,
  alwaysShowCounter = false,
}: CounterButtonProps) {
  return (
    <div className="flex">
      {counter < max && (
        <div
          className={twJoin(
            "w-10 h-10 flex items-center justify-center rounded-md bg-primary-highlight border border-accent-primary cursor-pointer",
            counter > 0 || alwaysShowCounter ? "rounded-r-none" : "rounded",
          )}
          onClick={onAdd}
        >
          <AiOutlinePlus size={20} />
        </div>
      )}
      {0 < counter && 1 < max && (
        <div
          className={twJoin(
            "px-2 sm:px-4 h-10 flex items-center border border-accent-primary text-sm sm:text-base",
            counter === max ? "rounded-md" : "border-l-0 rounded-r-md",
            "cursor-pointer",
          )}
        >
          {counter}/{max}
        </div>
      )}
      {alwaysShowCounter && counter === 0 && (
        <div
          className={twJoin(
            "px-2 sm:px-4 h-10 flex items-center border border-accent-primary rounded-r-md border-l-0 text-sm sm:text-base",
            "cursor-pointer",
          )}
        >
          {counter}/{max}
        </div>
      )}
    </div>
  );
}
