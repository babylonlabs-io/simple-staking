import { Heading, Text } from "@babylonlabs-io/core-ui";
import Image from "next/image";

interface MessageProps {
  title: string;
  message: string;
  icon: {
    src: any;
    alt?: string;
    width?: number;
    height?: number;
    rotate?: number;
  };
}

export const Message: React.FC<MessageProps> = ({ title, message, icon }) => {
  const iconWithDefaults = {
    alt: "Icon",
    width: 120,
    height: 122,
    rotate: 12,
    ...icon,
  };

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex flex-1 flex-col items-center justify-center gap-8">
        <div className={`rotate-${iconWithDefaults.rotate}`}>
          <Image
            src={iconWithDefaults.src}
            alt={iconWithDefaults.alt}
            width={iconWithDefaults.width}
            height={iconWithDefaults.height}
          />
        </div>
        <div className="flex flex-col gap-2 justify-center items-center self-stretch">
          <Heading variant="h5" className="text-accent-primary text-2xl">
            {title}
          </Heading>
          <Text
            variant="body1"
            className="text-center text-base text-accent-secondary p-0 whitespace-pre-line"
          >
            {message}
          </Text>
        </div>
      </div>
    </div>
  );
};
