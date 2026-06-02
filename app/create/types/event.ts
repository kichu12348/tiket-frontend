export interface CreateEventPayload {
  title: string;
  description: string;
  coverImage: string | null;
  locationType: "online" | "offline" | "hybrid";
  locationDetails: string;
  startDate: string;
  endDate: string;
  timezone: string;
  registrationStart: string;
  registrationEnd: string;
  fontFamily: string;
  requireApproval: boolean;
  capacity: number | null;
  color: string;
  status: "published" | "draft";
}
