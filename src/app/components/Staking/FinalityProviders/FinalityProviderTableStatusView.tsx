import { twMerge } from "tailwind-merge";

interface StatusViewProps {
  icon: React.ReactNode | string;
  title?: string;
  description?: React.ReactNode;
  className?: string;
}

export const StatusView = ({
  icon,
  title,
  description,
  className,
}: StatusViewProps) => (
  <div
    className={twMerge("flex items-center justify-center h-[21rem]", className)}
  >
    <div className="flex flex-col items-center gap-4">
      <div className="bg-primary-contrast relative">{icon}</div>
      {title && <h4 className="mb-2 font-sans font-bold text-h6">{title}</h4>}
      {description && (
        <p className="font-medium text-callout text-itemSecondaryDefault text-pretty">
          {description}
        </p>
      )}
    </div>
  </div>
);
