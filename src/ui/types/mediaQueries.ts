export type Breakpoint =
  | "initial"
  | "trout"
  | "perch"
  | "flounder"
  | "salmon"
  | "tuna"
  | "whale"
  | "whaleShark";

export type Breakpoints = Record<Breakpoint, number>;
