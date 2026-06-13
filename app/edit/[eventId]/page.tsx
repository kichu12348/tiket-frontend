import { redirect } from "next/navigation";

export default async function EditEventRedirect({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const resolvedParams = await params;
  redirect(`/edit/${resolvedParams.eventId}/overview`);
}
