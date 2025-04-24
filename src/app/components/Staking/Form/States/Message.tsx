import { Heading, Text } from "@babylonlabs-io/core-ui";

interface MessageProps {
  title: string;
  message: React.ReactNode;
  icon: JSX.Element;
}

export const Message: React.FC<MessageProps> = ({ title, message, icon }) => {
  return (
    <div className="flex flex-1 flex-col py-4 text-withLink max-w-[550px] mx-auto text-pretty">
      <div className="flex flex-1 flex-col items-center justify-center gap-8">
        {icon}
        <div className="flex flex-col gap-3 justify-center items-center self-stretch">
          <Heading
            variant="h5"
            className="text-accent-primary text-center text-2xl"
          >
            {title}
          </Heading>
          <Text
            variant="body1"
            className="text-center text-base text-accent-secondary p-0 whitespace-pre-line font-medium"
          >
            {message}
          </Text>
        </div>
      </div>
    </div>
  );
};
