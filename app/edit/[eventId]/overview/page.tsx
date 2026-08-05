"use client";

import { useEffect, useState } from "react";
import { useEventStore } from "@/store/useEventStore";
import { format } from "date-fns";
import Link from "next/link";
import { getEventHosts, EventHost } from "@/api/events";
import {
  Calendar,
  MapPin,
  Users,
  ExternalLink,
  Edit2,
  Clock,
  ShieldCheck,
  MailX,
} from "lucide-react";
import styles from "./Overview.module.css";

export default function EditOverviewPage() {
  const { event } = useEventStore();

  const [hosts, setHosts] = useState<EventHost[]>([]);
  const [isLoadingHosts, setIsLoadingHosts] = useState(true);

  useEffect(() => {
    if (event?.id) {
      getEventHosts(event.id)
        .then(setHosts)
        .catch(console.error)
        .finally(() => setIsLoadingHosts(false));
    }
  }, [event?.id]);

  if (!event) return null;

  const eventLink =
    typeof window !== "undefined"
      ? `${window.location.origin}/${event.slug}`
      : `/${event.slug}`;
  const totalCapacity = event.capacity || 0;
  const registeredCount = 0; // Placeholder until backend supports registrations
  const capacityPercentage =
    totalCapacity > 0 ? (registeredCount / totalCapacity) * 100 : 0;

  const getLocationDisplay = () => {
    if (!event.locationDetails) return "TBA";
    if (event.locationType === "offline" || event.locationType === "hybrid") {
      const details =
        typeof event.locationDetails === "string"
          ? (() => {
              try {
                return JSON.parse(event.locationDetails);
              } catch {
                return event.locationDetails;
              }
            })()
          : event.locationDetails;
      if (details && typeof details === "object") {
        return details.name || details.address || "TBA";
      }
      return event.locationDetails;
    }
    return event.locationDetails;
  };

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.statusBadge} data-status={event.status}>
            <span className={styles.statusDot} />
            {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
          </div>
          <h1 className={styles.title}>{event.title || "Untitled Event"}</h1>
        </div>
        <div className={styles.headerRight}>
          <Link
            href={eventLink}
            target="_blank"
            className={styles.btnSecondary}
          >
            <ExternalLink size={16} />
            View Event Page
          </Link>
          <Link
            href={`/edit/${event.id}/details`}
            className={styles.btnPrimary}
          >
            <Edit2 size={16} />
            Edit Details
          </Link>
        </div>
      </div>

      {/* Event Recap */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <div>
            <h2 className={styles.sectionTitle}>Event Recap</h2>
            <span className={styles.sectionSubtitle}>
              Quick overview of your event's core details.
            </span>
          </div>
        </div>
        <div className={styles.recapGrid}>
          <div className={styles.recapItem}>
            <Calendar size={18} className={styles.recapIcon} />
            <div className={styles.recapText}>
              <span style={{ fontWeight: 500, color: "var(--text-primary)" }}>
                {format(new Date(event.startDate), "EEEE, MMM d")}
              </span>
              <span>
                {format(new Date(event.startDate), "h:mm a")} -{" "}
                {format(new Date(event.endDate), "h:mm a")}
              </span>
            </div>
          </div>
          <div className={styles.recapItem}>
            <MapPin size={18} className={styles.recapIcon} />
            <div className={styles.recapText}>
              <span style={{ fontWeight: 500, color: "var(--text-primary)" }}>
                {event.locationType === "online"
                  ? "Virtual Event"
                  : event.locationType === "hybrid"
                    ? "Hybrid Event"
                    : "In-Person"}
              </span>
              <span
                style={{
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  maxWidth: "200px",
                }}
              >
                {getLocationDisplay()}
              </span>
            </div>
          </div>
          <div className={styles.recapItem}>
            <Users size={18} className={styles.recapIcon} />
            <div className={styles.recapText}>
              <span style={{ fontWeight: 500, color: "var(--text-primary)" }}>
                {event.capacity
                  ? `${event.capacity} Guests Max`
                  : "Unlimited Capacity"}
              </span>
              <span>
                {event.requireApproval ? "Approval Required" : "Auto-Approval"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* At a Glance (Metrics) */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <div>
            <h2 className={styles.sectionTitle}>At a Glance</h2>
            <span className={styles.sectionSubtitle}>
              Registration progress and capacity.
            </span>
          </div>
        </div>
        <div>
          <div className={styles.glanceStats}>
            <span className={styles.statLarge}>{registeredCount}</span>
            <span className={styles.statTotal}>
              / {totalCapacity > 0 ? totalCapacity : "∞"}
            </span>
            <span className={styles.statLabel}>registered guests</span>
          </div>
          <div className={styles.progressBarContainer}>
            <div
              className={styles.progressBarFill}
              style={{ width: `${capacityPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Recent Registrations */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <div>
            <h2 className={styles.sectionTitle}>Recent Registrations</h2>
            <span className={styles.sectionSubtitle}>
              The latest attendees who signed up for your event.
            </span>
          </div>
          <Link
            href={`/edit/${event.id}/tickets`}
            className={styles.btnSecondary}
          >
            Manage Tickets
          </Link>
        </div>

        {/* Placeholder Empty State until Backend supports registrations */}
        <div className={styles.emptyState}>
          <Clock size={32} color="var(--border-strong)" />
          <span className={styles.emptyStateText}>No registrations yet.</span>
        </div>
      </div>

      {/* Hosts Management */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <div>
            <h2 className={styles.sectionTitle}>Hosts</h2>
            <span className={styles.sectionSubtitle}>
              Manage who has admin access to this event.
            </span>
          </div>
          <button className={styles.btnSecondary}>
            + Add Host
          </button>
        </div>

        <div className={styles.listContainer}>
          {isLoadingHosts ? (
            <div className={styles.emptyState} style={{ padding: "1rem" }}>
              <span className={styles.emptyStateText}>Loading hosts...</span>
            </div>
          ) : hosts.length > 0 ? (
            hosts.map((host) => (
              <div key={host.id} className={styles.listItem}>
                <div className={styles.userInfo}>
                  <div className={styles.avatar}>
                    {host.name ? host.name.charAt(0).toUpperCase() : "U"}
                  </div>
                  <div className={styles.userDetails}>
                    <span className={styles.userName}>{host.name}</span>
                    <span className={styles.userEmail}>{host.email}</span>
                  </div>
                </div>
                <div className={styles.userMeta}>
                  <span
                    className={`${styles.badge} ${
                      host.isCreator ? styles.primary : ""
                    }`}
                  >
                    {host.role}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className={styles.emptyState} style={{ padding: "1rem" }}>
              <span className={styles.emptyStateText}>No hosts found.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
