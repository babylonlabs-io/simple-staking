import { ReactNode } from "react";

interface NavProps {
  children: ReactNode;
}

export const Nav = ({ children }: NavProps) => {
  return (
    <nav className="flex gap-6 justify-center items-center">{children}</nav>
  );
};
