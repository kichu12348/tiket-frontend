export interface Event {
  id: string;
  title: string;
  description: string | null;
  coverImage: string | null;
  color: string | null;
  locationType: "online" | "offline" | "hybrid";
  locationDetails: any;
  startDate: string;
  endDate: string;
  timezone: string;
  registrationStart: string | null;
  registrationEnd: string | null;
  fontFamily: string;
  requireApproval: boolean;
  capacity: number | null;
  status: "draft" | "published" | "completed" | "cancelled";
  slug: string;
  organizationId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateEventPayload {
  title: string;
  description: string;
  coverImage: string | null;
  locationType: "online" | "offline" | "hybrid";
  locationDetails: any;
  startDate: string;
  endDate: string;
  timezone: string;
  registrationStart: string;
  registrationEnd: string;
  fontFamily: string;
  requireApproval: boolean;
  capacity: number | null;
  color: string;
  status: "published" | "draft" | "completed" | "cancelled";
  slug: string;
}

export interface UpdateEventPayload extends Partial<
  Omit<CreateEventPayload, "status">
> {
  status?: "draft" | "published" | "completed" | "cancelled";
}
