import { Button } from "@babylonlabs-io/core-ui";

import { useStakingService } from "../hooks/services/useStakingService";

/**
 * A test button to trigger error handling for development purposes.
 * This component should only be used during development and testing.
 */
export const TestErrorButton: React.FC = () => {
  const { triggerTestError } = useStakingService();

  // Only render in development mode
  if (process.env.NODE_ENV === "production") {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Button
        onClick={triggerTestError}
        className="bg-red-500 hover:bg-red-600 text-white"
      >
        Test Error Modal
      </Button>
    </div>
  );
};
