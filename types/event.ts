export interface Event {
  id: string;
  title: string;
  description: string | null;
  coverImage: string | null;
  color: string | null;
  locationType: "online" | "offline" | "hybrid";
  locationDetails: string | null;
  startDate: string;
  endDate: string;
  timezone: string;
  registrationStart: string | null;
  registrationEnd: string | null;
  fontFamily: string;
  requireApproval: boolean;
  capacity: number | null;
  status: "draft" | "published" | "completed" | "cancelled";
  organizationId: string;
  createdAt: string;
  updatedAt: string;
}
