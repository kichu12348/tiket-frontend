"use client";

import { useEventStore } from "@/store/useEventStore";
import { format } from "date-fns";
import Link from "next/link";
import { Calendar, MapPin, Users, Settings, Tag } from "lucide-react";
import styles from "./Overview.module.css";
import { getImageUrl } from "@/constants/config";

export default function EditOverviewPage() {
  const { event } = useEventStore();

  if (!event) return null;

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Event Overview</h1>
        <div className={styles.statusBadge} data-status={event.status}>
          {event.status.toUpperCase()}
        </div>
      </div>

      <div className={styles.grid}>
        {/* Main Info Card */}
        <div className={`${styles.card} ${styles.mainCard}`}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>{event.title || "Untitled Event"}</h2>
            <Link href={`/edit/${event.id}/details`} className={styles.editLink}>Edit Details</Link>
          </div>
          
          <div className={styles.metaList}>
            <div className={styles.metaItem}>
              <Calendar size={16} />
              <span>
                {format(new Date(event.startDate), "MMM d, yyyy h:mm a")} - {format(new Date(event.endDate), "h:mm a")}
              </span>
            </div>
            <div className={styles.metaItem}>
              <MapPin size={16} />
              <span>
                {event.locationType === "online" ? "Virtual Event" : event.locationType === "hybrid" ? "Hybrid Event" : "In-Person Event"}
              </span>
            </div>
            <div className={styles.metaItem}>
              <Users size={16} />
              <span>Capacity: {event.capacity ? event.capacity : "Unlimited"}</span>
            </div>
          </div>
        </div>

        {/* Poster Preview Card */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h3 className={styles.sectionTitle}>Event Poster</h3>
            <Link href={`/edit/${event.id}/details`} className={styles.editLink}>Edit Poster</Link>
          </div>
          {event.coverImage ? (
            <div className={styles.posterWrapper}>
              <img src={getImageUrl(event.coverImage)} alt="Poster" className={styles.poster} />
            </div>
          ) : (
            <div className={styles.emptyState}>No poster uploaded</div>
          )}
        </div>

        {/* Quick Links / Status */}
        <div className={styles.card}>
          <h3 className={styles.sectionTitle}>Configuration</h3>
          <div className={styles.configList}>
            <Link href={`/edit/${event.id}/tickets`} className={styles.configItem}>
              <Tag size={18} />
              <span>Manage Tickets</span>
            </Link>
            <Link href={`/edit/${event.id}/forms`} className={styles.configItem}>
              <Users size={18} />
              <span>Registration Form</span>
            </Link>
            <Link href={`/edit/${event.id}/settings`} className={styles.configItem}>
              <Settings size={18} />
              <span>Advanced Settings</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
