import { NavLink } from "react-router";
import { twJoin } from "tailwind-merge";

interface NavItemProps {
  title: string;
  to: string;
}

export const NavItem = ({ title, to }: NavItemProps) => {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        twJoin(
          "w-32 h-10 text-center whitespace-nowrap flex items-center justify-center",
          isActive ? "text-accent-primary" : "text-accent-secondary",
        )
      }
    >
      {title}
    </NavLink>
  );
};
