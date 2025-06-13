import { IoIosWarning } from "react-icons/io";

export function Overflow() {
  return (
    <div className="inline-flex items-center gap-1 rounded-md bg-primary px-2 py-1 text-xs text-white">
      <IoIosWarning size={16} />
      <p>overflow</p>
    </div>
  );
}
