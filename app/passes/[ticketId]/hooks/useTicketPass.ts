import { useEffect, useState } from "react";
import { getTicketPass } from "@/api/tickets";
import { TicketPassData } from "@/types/ticket";

export function useTicketPass(ticketId: string | undefined) {
  const [ticket, setTicket] = useState<TicketPassData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTicket() {
      if (!ticketId) return;

      setIsLoading(true);
      setError(null);

      try {
        const data = await getTicketPass(ticketId);
        if (data && data.id) {
          setTicket(data);
        } else {
          setError("Ticket pass not found.");
        }
      } catch (err: any) {
        const message =
          err?.response?.data?.error || err?.message || "Failed to load ticket pass.";
        setError(message);
      } finally {
        setIsLoading(false);
      }
    }

    fetchTicket();
  }, [ticketId]);

  return { ticket, isLoading, error };
}
