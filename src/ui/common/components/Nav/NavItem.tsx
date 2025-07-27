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
          "px-4 py-2 rounded transition-colors duration-200 text-primary",
          isActive ? "bg-secondary-highlight" : "bg-transparent",
        )
      }
    >
      {title}
    </NavLink>
  );
};
