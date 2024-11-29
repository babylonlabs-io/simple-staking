import { Dialog, MobileDialog } from "@babylonlabs-io/bbn-core-ui";
import { useMemo } from "react";

import { useIsMobileView } from "@/app/hooks/useBreakpoint";

import { StageEnd } from "./StageEnd";
import { StageStart } from "./StageStart";
import { StageStepping } from "./StageStepping";

interface TransitionModalProps {
  open: boolean;
  onClose: () => void;
  onSign: () => void;
  stage:
    | "start"
    | "step-1"
    | "step-2"
    | "step-3"
    | "step-4"
    | "pre-end"
    | "end";
}

export function TransitionModal({
  open,
  onClose,
  onSign,
  stage,
}: TransitionModalProps) {
  const isMobileView = useIsMobileView();
  const DialogComponent = isMobileView ? MobileDialog : Dialog;

  const content = useMemo(() => {
    const stageUIMapping = {
      start: <StageStart onClose={onClose} />,
      "step-1": <StageStepping step={1} onClose={onClose} onSign={onSign} />,
      "step-2": (
        <StageStepping
          step={2}
          onClose={onClose}
          onSign={onSign}
          awaitingResponse={true}
        />
      ),
      "step-3": (
        <StageStepping
          step={3}
          onClose={onClose}
          onSign={onSign}
          awaitingResponse={true}
        />
      ),
      "step-4": (
        <StageStepping
          step={4}
          onClose={onClose}
          onSign={onSign}
          awaitingResponse={true}
        />
      ),
      "pre-end": (
        <StageStepping
          step={5}
          onClose={onClose}
          onSign={onSign}
          awaitingResponse={true}
        />
      ),
      end: <StageEnd onClose={onClose} />,
    };

    return stageUIMapping[stage];
  }, [onClose, onSign, stage]);

  return (
    <DialogComponent open={open} onClose={onClose}>
      {content}
    </DialogComponent>
  );
}
