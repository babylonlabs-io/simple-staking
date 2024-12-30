import { Dialog, MobileDialog } from "@babylonlabs-io/bbn-core-ui";

import { useIsMobileView } from "@/app/hooks/useBreakpoint";

import { StageEnd } from "./StageEnd";
import { StageStart } from "./StageStart";
import { StageStepping } from "./StageStepping";

export type TransitionStage =
  | "start"
  | "step-1"
  | "step-2"
  | "step-3"
  | "step-4"
  | "pre-end"
  | "end";

export interface TransitionModalProps {
  open: boolean;
  onClose: () => void;
  onSign: () => void;
  onProceed?: () => void;
  stage: TransitionStage;
}

const stageUIMapping = {
  start: ({ onClose, onProceed }: TransitionModalProps) => (
    <StageStart onClose={onClose} onProceed={onProceed} />
  ),
  "step-1": ({ onClose, onSign }: TransitionModalProps) => (
    <StageStepping step={1} onClose={onClose} onSign={onSign} />
  ),
  "step-2": ({ onClose, onSign }: TransitionModalProps) => (
    <StageStepping
      step={2}
      onClose={onClose}
      onSign={onSign}
      awaitingResponse={true}
    />
  ),
  "step-3": ({ onClose, onSign }: TransitionModalProps) => (
    <StageStepping
      step={3}
      onClose={onClose}
      onSign={onSign}
      awaitingResponse={true}
    />
  ),
  "step-4": ({ onClose, onSign }: TransitionModalProps) => (
    <StageStepping
      step={4}
      onClose={onClose}
      onSign={onSign}
      awaitingResponse={true}
    />
  ),
  "pre-end": ({ onClose, onSign }: TransitionModalProps) => (
    <StageStepping
      step={5}
      onClose={onClose}
      onSign={onSign}
      awaitingResponse={true}
    />
  ),
  end: ({ onClose }: TransitionModalProps) => <StageEnd onClose={onClose} />,
} as const;

export function TransitionModal(props: TransitionModalProps) {
  const { open, onClose, stage } = props;
  const isMobileView = useIsMobileView();
  const DialogComponent = isMobileView ? MobileDialog : Dialog;

  const Content = stageUIMapping[stage];

  return (
    <DialogComponent open={open} onClose={onClose}>
      <Content {...props} />
    </DialogComponent>
  );
}
