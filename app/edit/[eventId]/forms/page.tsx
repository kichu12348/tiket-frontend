"use client";

import { useEventStore } from "@/store/useEventStore";
import RegistrationFormPanel from "../components/RegistrationFormPanel";

export default function EditFormsPage() {
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
          Registration Forms
        </h1>
        <p style={{ color: "var(--text-secondary)", marginTop: "0.5rem" }}>
          Add custom questions to collect information from your attendees during
          checkout.
        </p>
      </div>

      <RegistrationFormPanel eventId={event.id} />
    </div>
  );
}
