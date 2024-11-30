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
const stageUIMapping = {
      start: ({ onClose }: TransitionModalProps) => <StageStart onClose={onClose} />,
      "step-1": ({ onClose, onSign }: TransitionModalProps) =>  <StageStepping step={1} onClose={onClose} onSign={onSign} />,
      "step-2": ({ onClose, onSign }: TransitionModalProps) =>  (
        <StageStepping
          step={2}
          onClose={onClose}
          onSign={onSign}
          awaitingResponse={true}
        />
      ),
      "step-3": ({ onClose, onSign }: TransitionModalProps) =>  (
        <StageStepping
          step={3}
          onClose={onClose}
          onSign={onSign}
          awaitingResponse={true}
        />
      ),
      "step-4": ({ onClose, onSign }: TransitionModalProps) =>  (
        <StageStepping
          step={4}
          onClose={onClose}
          onSign={onSign}
          awaitingResponse={true}
        />
      ),
      "pre-end": ({ onClose, onSign }: TransitionModalProps) =>  (
        <StageStepping
          step={5}
          onClose={onClose}
          onSign={onSign}
          awaitingResponse={true}
        />
      ),
      end: ({ onClose }: TransitionModalProps) => <StageEnd onClose={onClose} />,
    } as const
export function TransitionModal({
  open,
  onClose,
  onSign,
  stage,
}: TransitionModalProps) {
  const isMobileView = useIsMobileView();
  const DialogComponent = isMobileView ? MobileDialog : Dialog;

  const Content = stageUIMapping[props.stage]

  return (
    <DialogComponent open={open} onClose={onClose}>
      <Content {...props} />
    </DialogComponent>
  );
}
