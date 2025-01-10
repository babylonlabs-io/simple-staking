import Image from "next/image";
import Link from "next/link";

import logo from "@/app/assets/logo-white.svg";

interface LogoProps {
  className?: string;
  width?: number;
  height?: number;
}

export const Logo: React.FC<LogoProps> = ({
  className,
  width = 159,
  height = 40,
}) => {
  const dimensions = {
    width: width,
    height: height,
  };

  return (
    <Link href="/">
      <Image
        className={className}
        style={dimensions}
        src={logo}
        alt="Babylon"
        width={dimensions.width}
        height={dimensions.height}
      />
    </Link>
  );
};
