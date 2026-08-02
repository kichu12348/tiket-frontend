import { API_ENDPOINTS, API_URL } from "@/constants/config";
import { TicketType } from "@/types/ticketType";
import { FormField } from "@/types/form";
import { createOrder, payOrderMock } from "@/api/orders";
import { PurchaseFormResponse } from "@/types/order";

/**
 * Registration API Service Layer
 * Abstracts data fetching and order submission operations for event registration.
 */

export async function fetchTicketTypes(eventId: string): Promise<TicketType[]> {
  try {
    const res = await fetch(
      `${API_URL}${API_ENDPOINTS.TICKET_TYPES.GET_ALL(eventId)}`,
      {
        next: { revalidate: 60 },
      },
    );
    if (!res.ok) return [];
    return res.json();
  } catch (error) {
    console.error("Failed to fetch ticket types:", error);
    return [];
  }
}

export async function fetchFormFields(eventId: string): Promise<FormField[]> {
  try {
    const res = await fetch(
      `${API_URL}${API_ENDPOINTS.FORMS.GET_ALL(eventId)}`,
      {
        next: { revalidate: 60 },
      },
    );
    if (!res.ok) return [];
    return res.json();
  } catch (error) {
    console.error("Failed to fetch form fields:", error);
    return [];
  }
}

export interface SubmitRegistrationParams {
  eventId: string;
  ticketTypeId: string;
  formResponses: PurchaseFormResponse[];
}

export async function submitRegistrationOrder({
  eventId,
  ticketTypeId,
  formResponses,
}: SubmitRegistrationParams): Promise<{ createdTicketId: string | null }> {
  const orderResponse = await createOrder({
    eventId,
    purchases: [{ ticketTypeId, formResponses }],
  });

  if (orderResponse?.order?.id) {
    await payOrderMock(orderResponse.order.id);
  }

  const createdTicketId = orderResponse?.tickets?.[0]?.id ?? null;
  return { createdTicketId };
}
