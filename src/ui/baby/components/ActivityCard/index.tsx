import { ActivityCard } from "@babylonlabs-io/core-ui";

interface BabyActivityCardData {
  icon: string;
  formattedAmount: string;
  primaryAction?: {
    label: string;
    variant: "contained" | "outlined";
    onClick: () => void;
  };
  details: Array<{
    label: string;
    value: React.ReactNode;
  }>;
  optionalDetails?: Array<{
    label: string;
    value: React.ReactNode;
  }>;
}

interface BabyActivityCardProps {
  activityData: BabyActivityCardData;
}

export function BabyActivityCard({ activityData }: BabyActivityCardProps) {
  return <ActivityCard data={activityData} />;
}
