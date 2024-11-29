import { IoCheckmarkSharp } from "react-icons/io5";

export function Tick() {
  return (
    <div className="rounded-full bg-primary-light flex h-10 w-10 items-center justify-center">
      <IoCheckmarkSharp size={24} className="text-secondary-contrast" />
    </div>
  );
}
