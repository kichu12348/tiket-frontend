"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import QRCode from "react-qr-code";
import styles from "./Pass.module.css";
import { format } from "date-fns";

// Mocking the ticket data structure that the backend will eventually provide
interface TicketPassPayload {
  ticketId: string;
  qrCode: string; // The raw payload for the QR
  status: "valid" | "checked-in" | "cancelled";
  eventName: string;
  ticketTypeName: string;
  attendeeName: string;
  orderId: string;
  startDate: string;
  locationDetails: string;
  locationType: "online" | "offline" | "hybrid";
  timezone: string;
}

export default function TicketPassPage() {
  const { ticketId } = useParams();
  const [ticket, setTicket] = useState<TicketPassPayload | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // In the future, this will be: await getTicketPass(ticketId as string);
    // Simulating a backend fetch
    setTimeout(() => {
      setTicket({
        ticketId: ticketId as string,
        qrCode: `TKT-${ticketId}-VAL-XYZ123`,
        status: "valid",
        eventName: "Summer Night Live",
        ticketTypeName: "General Admission",
        attendeeName: "Jane Doe",
        orderId: "ORD-987654321",
        startDate: new Date(Date.now() + 86400000 * 5).toISOString(), // 5 days from now
        locationDetails: "Skyline Arena, Kochi, Kerala",
        locationType: "offline",
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      });
      setIsLoading(false);
    }, 1000);
  }, [ticketId]);

  if (isLoading) {
    return <div className={styles.loading}>Loading your ticket pass...</div>;
  }

  if (!ticket) {
    return <div className={styles.error}>Ticket not found.</div>;
  }

  const isInvalid = ticket.status !== "valid";

  return (
    <div className={styles.page}>
      <div className={styles.passContainer}>
        {/* Apple Wallet Style Semantic Ticket */}
        <div className={`${styles.pass} ${isInvalid ? styles.invalidPass : ""}`}>
          
          {/* Header */}
          <div className={styles.header}>
            <div className={styles.headerTop}>
              <span className={styles.ticketType}>{ticket.ticketTypeName}</span>
              <span className={styles.statusBadge} data-status={ticket.status}>
                {ticket.status.toUpperCase()}
              </span>
            </div>
            <h1 className={styles.eventName}>{ticket.eventName}</h1>
          </div>

          {/* Details Grid */}
          <div className={styles.detailsGrid}>
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Attendee</span>
              <span className={styles.detailValue}>{ticket.attendeeName}</span>
            </div>
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Date & Time</span>
              <span className={styles.detailValue}>
                {format(new Date(ticket.startDate), "EEE, MMM d, yyyy")} <br />
                {format(new Date(ticket.startDate), "h:mm a")} ({ticket.timezone})
              </span>
            </div>
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Location</span>
              <span className={styles.detailValue}>
                {ticket.locationType === "online" ? "Virtual Event (Link attached to order)" : ticket.locationDetails}
              </span>
            </div>
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Order Reference</span>
              <span className={styles.detailValue}>{ticket.orderId}</span>
            </div>
          </div>

          <hr className={styles.divider} />

          {/* QR Code Section */}
          <div className={styles.qrSection}>
            <div className={styles.qrWrapper}>
              <QRCode
                value={ticket.qrCode}
                size={200}
                level="H"
                style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                fgColor={isInvalid ? "#999999" : "#000000"}
              />
              {isInvalid && (
                <div className={styles.watermark}>
                  {ticket.status === "checked-in" ? "CHECKED IN" : "CANCELLED"}
                </div>
              )}
            </div>
            <span className={styles.ticketId}>ID: {ticket.ticketId}</span>
            <span className={styles.instructions}>
              Present this code at the entrance for scanning.
            </span>
          </div>

        </div>

        {/* Action Buttons (Hidden when printing) */}
        <div className={styles.actions}>
          <button className={styles.actionBtn} onClick={() => window.print()}>
            Print Pass
          </button>
        </div>
      </div>
    </div>
  );
}
