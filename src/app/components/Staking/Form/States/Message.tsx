import Image from "next/image";

interface MessageProps {
  title: string;
  messages: string[];
  icon: any;
}

// Used for
// - Staking cap reached
// - Staking has not started yet
// - Staking params are upgrading
export const Message: React.FC<MessageProps> = ({ title, messages, icon }) => {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-2 rounded-2xl border border-neutral-content p-4 dark:border-neutral-content/20">
      <div className="rounded-full bg-base-200 p-4">
        <Image src={icon} alt={title} width={32} height={32} />
      </div>
      <h3 className="font-bold">{title}</h3>
      <div className="flex flex-col items-center justify-center">
        {messages.map((message) => (
          <p
            key={message}
            className="text-center text-sm font-light dark:text-neutral-content"
          >
            {message}
          </p>
        ))}
      </div>
    </div>
  );
};
