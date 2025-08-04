/* eslint-disable @typescript-eslint/ban-ts-comment */
import {
  Button,
  DialogBody,
  DialogFooter,
  DialogHeader,
  Form,
  Text,
  Warning,
} from "@babylonlabs-io/core-ui";

import { AmountField } from "@/ui/baby/components/AmountField";
import { ResponsiveDialog } from "@/ui/common/components/Modals/ResponsiveDialog";

interface UnbondingModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: () => void;
}

const MAX_WINDOW_HEIGHT = 500;

export const UnbondingModal = ({ open, onClose }: UnbondingModalProps) => {
  return (
    <Form>
      <ResponsiveDialog open={open} onClose={onClose}>
        <DialogHeader
          title="Unbond Babylon Labs 0"
          onClose={onClose}
          className="text-accent-primary"
        />

        <DialogBody
          style={{ maxHeight: MAX_WINDOW_HEIGHT }}
          className="no-scrollbar mt-4 flex flex-col gap-6 overflow-y-auto text-accent-primary"
        >
          <Text
            as="div"
            variant="body2"
            className="text-accent-secondary whitespace-pre-line"
          >
            Choose how much BABY you’d like to unbond from your current
            delegation. Unbonded tokens will enter a waiting period before they
            become available to withdraw. Your remaining stake will continue
            earning rewards.
          </Text>

          <AmountField balance={100} price={100} />

          <Warning>
            Once the unstaking period begins:
            <br />• You will not receive staking rewards
            <br />• It will take 50 hours for the amount to be liquid
            <br />• But you will be able to cancel the unstaking process
            anytime, as this chain currently supports the function
          </Warning>
        </DialogBody>

        <DialogFooter className="flex justify-end mt-[80px]">
          {/* @ts-expect-error */}
          <Button type="submit">Unbond</Button>
        </DialogFooter>
      </ResponsiveDialog>
    </Form>
  );
};
