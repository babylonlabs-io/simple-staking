import { MdErrorOutline } from "react-icons/md";

import { Alert } from "@/ui/common/components/Alerts/Alert";
import { STAKING_DISABLED } from "@/ui/common/constants";
import { GEO_BLOCK_MESSAGE } from "@/ui/common/types/services/healthCheck";

interface FormAlertProps {
  address?: string;
  isGeoBlocked: boolean;
}

export const FormAlert = ({ address, isGeoBlocked }: FormAlertProps) => {
  const stakingDisabledMessage = (
    <>
      The Babylon network is under maintenance. New stakes are paused until the
      network resumes.
    </>
  );

  const shouldShowAlert = (address && STAKING_DISABLED) || isGeoBlocked;

  if (!shouldShowAlert) {
    return null;
  }

  return (
    <div className="pt-2">
      <Alert
        icon={<MdErrorOutline />}
        title={
          isGeoBlocked ? (
            <strong>Unavailable In Your Region.</strong>
          ) : (
            <strong>Staking Currently Unavailable.</strong>
          )
        }
      >
        {isGeoBlocked ? GEO_BLOCK_MESSAGE : stakingDisabledMessage}
      </Alert>
    </div>
  );
};
