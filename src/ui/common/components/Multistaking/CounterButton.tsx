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
  const isClickable = counter < max;
  const hasActiveCounter = counter > 0 && max > 1;
  const showsInitialCounter = alwaysShowCounter && counter === 0;
  const showsCounter = hasActiveCounter || showsInitialCounter;

  if (!showsCounter && !isClickable) {
    return null;
  }

  return (
    <div
      className={twJoin(
        "flex border border-accent-primary rounded-md bg-primary-highlight overflow-hidden",
        isClickable && "cursor-pointer",
      )}
      onClick={isClickable ? onAdd : undefined}
    >
      {isClickable && (
        <div className="w-10 h-10 flex items-center justify-center">
          <AiOutlinePlus size={20} />
        </div>
      )}
      {showsCounter && (
        <div className="px-2 sm:px-4 h-10 flex items-center text-sm sm:text-base border-l border-accent-primary">
          {counter}/{max}
        </div>
      )}
    </div>
  );
}
