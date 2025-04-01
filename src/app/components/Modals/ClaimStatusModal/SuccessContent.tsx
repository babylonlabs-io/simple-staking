import { Text } from "@babylonlabs-io/core-ui";

//import { BABYLON_EXPLORER } from "@/app/constants";

const BABYLON_EXPLORER = "/test";

export const SuccessContent = ({
  transactionHash,
}: {
  transactionHash?: string;
}) => (
  <div className="flex flex-col gap-4">
    <Text variant="body1" className="text-center">
      Your claim has been submitted and will be processed in 2 blocks.
    </Text>
    {transactionHash && (
      <div className="flex flex-col gap-2">
        <div className="flex flex-col sm:flex-row items-center justify-center">
          <Text variant="body2" className="font-semibold sm:mr-2 mb-1 sm:mb-0">
            Transaction Hash:
          </Text>
          {BABYLON_EXPLORER ? (
            <a
              href={`${BABYLON_EXPLORER}/transaction/${transactionHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary-light hover:text-primary-light/80 underline break-all text-sm text-center"
            >
              {transactionHash}
            </a>
          ) : (
            <Text className="break-all text-sm text-center">
              {transactionHash}
            </Text>
          )}
        </div>
      </div>
    )}
  </div>
);
