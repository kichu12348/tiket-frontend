export interface Event {
  id: string;
  title: string;
  description: string | null;
  coverImage: string | null;
  locationType: "online" | "offline";
  locationDetails: string | null;
  startDate: string;
  endDate: string;
  closingDate: string | null;
  status: "draft" | "published" | "completed" | "cancelled";
  organizationId: string;
  createdAt: string;
  updatedAt: string;
}
