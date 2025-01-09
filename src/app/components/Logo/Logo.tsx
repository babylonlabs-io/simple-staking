import Image from "next/image";
import Link from "next/link";

import logo from "@/app/assets/logo-white.svg";

interface LogoProps {}

export const Logo: React.FC<LogoProps> = () => {
  return (
    <Link href="/">
      <Image src={logo} alt="Babylon" />
    </Link>
  );
};
