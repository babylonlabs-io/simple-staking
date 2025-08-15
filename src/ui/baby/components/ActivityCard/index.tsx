import { ActivityCard, type ActivityCardData } from "@babylonlabs-io/core-ui";

interface BabyActivityCardProps {
  activityData: ActivityCardData;
}

export function BabyActivityCard({ activityData }: BabyActivityCardProps) {
  return <ActivityCard data={activityData} />;
}
