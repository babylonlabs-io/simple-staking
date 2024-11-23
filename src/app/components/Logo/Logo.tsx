import Image from "next/image";

import logo from "@/app/assets/logo-white.svg";

interface LogoProps {}

export const Logo: React.FC<LogoProps> = () => {
  return (
    <div className="flex">
      <Image src={logo} alt="Babylon" />
    </div>
  );
};
