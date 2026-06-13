"use client";

import { useEventStore } from "@/store/useEventStore";
import TicketTypesPanel from "../components/TicketTypesPanel";

export default function EditTicketsPage() {
  const { event } = useEventStore();

  if (!event) return null;

  return (
    <div style={{ padding: "2.5rem", maxWidth: "800px" }}>
      <div style={{ marginBottom: "2rem" }}>
        <h1
          style={{
            fontSize: "2rem",
            fontWeight: 700,
            margin: 0,
            color: "var(--text-primary)",
          }}
        >
          Tickets
        </h1>
        <p style={{ color: "var(--text-secondary)", marginTop: "0.5rem" }}>
          Manage your ticket tiers, pricing, and availability.
        </p>
      </div>

      <TicketTypesPanel eventId={event.id} />
    </div>
  );
}
