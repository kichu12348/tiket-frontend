"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import styles from "./Home.module.css";
import { Search, Plus } from "lucide-react";
import { BsCalendar4Week } from "react-icons/bs";
import { Event } from "@/types/event";
import SkeletonList from "./Components/SkeletonList";
import { getMyEvents } from "./api/events";

export default function Home() {
  const [activeTab, setActiveTab] = useState<"upcoming" | "past">("upcoming");
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        // Fetch user's events
        const data = await getMyEvents();
        setEvents(data);
      } catch (error) {
        console.error("Failed to fetch events:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  // Filter events based on active tab
  const now = new Date();
  const filteredEvents = events.filter((event) => {
    const eventDate = new Date(event.startDate);
    if (activeTab === "upcoming") {
      return eventDate >= now;
    } else {
      return eventDate < now;
    }
  });

  // Group events by Month and Day for the timeline
  const groupedEvents = filteredEvents.reduce(
    (acc, event) => {
      const date = new Date(event.startDate);
      const monthStr = date.toLocaleString("default", { month: "short" });
      const dayStr = date.getDate().toString().padStart(2, "0");
      const key = `${monthStr} ${dayStr}`;

      if (!acc[key]) {
        acc[key] = { monthStr, dayStr, events: [] };
      }
      acc[key].events.push(event);
      return acc;
    },
    {} as Record<string, { monthStr: string; dayStr: string; events: Event[] }>,
  );

  const timelineGroups = Object.values(groupedEvents);

  return (
    <div className={styles.page}>
      <div className={styles.background} />
      <div className={styles.container}>
        {/* Header */}
        <header className={styles.header}>
          <div className={styles.headerLeft}>
            <Link href="/" className={styles.logo}>
              Tiket<span className={styles.dot}>.</span>
            </Link>
          </div>

          <div className={styles.headerRight}>
            <Link href="/create" className={styles.createEventBtn}>
              <Plus size={18} strokeWidth={2.5} />
              <span>Create Event</span>
            </Link>
            <button className={styles.softIconBtn} aria-label="Search">
              <Search size={18} />
            </button>
            <div className={styles.avatar}>:)</div>
          </div>
        </header>

        {/* Main Content */}
        <main className={styles.main}>
          <div className={styles.topSection}>
            <h1 className={styles.pageTitle}>Events</h1>

            <div className={styles.toggleGroup}>
              <button
                className={`${styles.toggleBtn} ${activeTab === "upcoming" ? styles.toggleBtnActive : ""}`}
                onClick={() => setActiveTab("upcoming")}
              >
                Upcoming
              </button>
              <button
                className={`${styles.toggleBtn} ${activeTab === "past" ? styles.toggleBtnActive : ""}`}
                onClick={() => setActiveTab("past")}
              >
                Past
              </button>
            </div>
          </div>

          {loading ? (
            <SkeletonList count={4} />
          ) : timelineGroups.length > 0 ? (
            <div className={styles.timelineContainer}>
              {timelineGroups.map((group, groupIdx) => (
                <div key={groupIdx}>
                  {group.events.map((event, eventIdx) => (
                    <div key={event.id} className={styles.timelineRow}>
                      <div className={styles.timelineDate}>
                        {/* Only show date on the first event of the day */}
                        {eventIdx === 0 && (
                          <>
                            <span>{group.monthStr}</span>
                            <span className={styles.timelineDay}>
                              {group.dayStr}
                            </span>
                          </>
                        )}
                      </div>
                      <div className={styles.timelineLine}>
                        <div className={styles.timelineDot}></div>
                      </div>
                      <div className={styles.timelineContent}>
                        <div className={styles.eventCard}>
                          <div className={styles.eventInfo}>
                            <h3 className={styles.eventTitle}>{event.title}</h3>
                            <p className={styles.eventDescription}>
                              {event.description || "No description provided."}
                            </p>
                            <div className={styles.eventMetaList}>
                              <div className={styles.eventMetaItem}>
                                <div
                                  className={styles.skeletonIcon}
                                  style={{
                                    background: "rgba(255,255,255,0.1)",
                                  }}
                                ></div>
                                {new Date(event.startDate).toLocaleTimeString(
                                  [],
                                  { hour: "2-digit", minute: "2-digit" },
                                )}
                              </div>
                              <div className={styles.eventMetaItem}>
                                <div
                                  className={styles.skeletonIcon}
                                  style={{
                                    background: "rgba(255,255,255,0.1)",
                                  }}
                                ></div>
                                {event.locationType === "online"
                                  ? "Online"
                                  : event.locationDetails || "TBA"}
                              </div>
                            </div>
                          </div>
                          {event.coverImage ? (
                            <img
                              src={event.coverImage}
                              alt={event.title}
                              className={styles.eventImage}
                            />
                          ) : (
                            <div className={styles.imagePlaceholder}>
                              <BsCalendar4Week size={24} />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          ) : (
            <div className={styles.emptyState}>
              <div className={styles.emptyIconWrapper}>
                <BsCalendar4Week size={56} />
              </div>

              <h2 className={styles.emptyTitle}>No events here</h2>
              <p className={styles.emptySubtitle}>
                You haven't scheduled anything yet. Create your first event to
                get started.
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
