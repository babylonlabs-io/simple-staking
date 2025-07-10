import { MdErrorOutline } from "react-icons/md";

import { Alert } from "@/ui/common/components/Alerts/Alert";
import { STAKING_DISABLED } from "@/ui/common/constants";

interface FormAlertProps {
  address: string | undefined;
  isGeoBlocked: boolean;
  geoBlockMessage: string | undefined;
}

export const FormAlert = ({
  address,
  isGeoBlocked,
  geoBlockMessage,
}: FormAlertProps) => {
  const stakingDisabledMessage = (
    <>
      The Babylon network is temporarily halted. New stakes are paused until the
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
        {isGeoBlocked ? geoBlockMessage : stakingDisabledMessage}
      </Alert>
    </div>
  );
};
