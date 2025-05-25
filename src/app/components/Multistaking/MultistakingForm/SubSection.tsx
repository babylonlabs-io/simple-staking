import React from "react";

export const SubSection = ({
  children,
  style,
  className,
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
}) => (
  <div
    className={`flex bg-secondary-highlight text-[#12495E] p-4 ${className}`}
    style={style}
  >
    {children}
  </div>
);
