import styles from "./EventPage.module.css";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { getImageUrl } from "@/constants/config";
import { FiMapPin } from "react-icons/fi";
import { getEventBySlug, getMe } from "./api/eventApi";
import { formatEventDates, parseLocationDetails } from "./utils/formatters";
import RegistrationCard from "./components/RegistrationCard";
import EventLocation from "./components/EventLocation";
import { FiArrowUpRight } from "react-icons/fi";

interface PageProps {
  params: Promise<{ eventSlug: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const resolvedParams = await params;
  const event = await getEventBySlug(resolvedParams.eventSlug);
  if (!event) return { title: "Event Not Found" };
  return {
    title: `${event.title}`,
    description: event.description || "Join this amazing event!",
    openGraph: {
      title: event.title,
      description: event.description,
      images: [
        {
          url: getImageUrl(event.coverImage || ""),
          width: 800,
          height: 600,
          alt: event.title,
        },
      ],
    },
  };
}

export default async function EventPage({ params }: PageProps) {
  const resolvedParams = await params;
  const event = await getEventBySlug(resolvedParams.eventSlug);
  if (!event) return notFound();

  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  let user = null;
  if (token) {
    user = await getMe(token);
  }

  const { formattedDate, formattedTime, monthShort, dayNumber } =
    formatEventDates(event.startDate, event.endDate);

  const customBg = event.color || "#3B3E2F";

  const locationData = parseLocationDetails(event.locationDetails);
  const { city, state, name } = locationData;

  return (
    <div
      className={styles.pageWrapper}
      style={
        {
          "--event-bg": customBg,
          "--event-font": event.fontFamily,
        } as React.CSSProperties
      }
    >
      <div className={styles.page}>
        <div className={styles.contentContainer}>
          {/* Left Column */}
          <div className={styles.leftColumn}>
            <div className={styles.posterWrapper}>
              {event.coverImage ? (
                <img
                  src={getImageUrl(event.coverImage)}
                  alt={event.title}
                  className={styles.posterImage}
                />
              ) : (
                <div
                  className={styles.posterImage}
                  style={{ backgroundColor: event.color || "#000000" }}
                />
              )}
            </div>

            <div className={styles.hostSection}>
              <div className={styles.hostAvatar}></div>
              <div className={styles.hostDetails}>
                <span className={styles.hostedByLabel}>Hosted by</span>
                <span className={styles.hostName}>The Host</span>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className={styles.rightColumn}>
            <div className={styles.headerSection}>
              <h1
                className={styles.title}
                style={{ fontFamily: event.fontFamily }}
              >
                {event.title}
              </h1>

              <div className={styles.metaInfo}>
                <div className={styles.metaItem}>
                  <div className={styles.calendarChip}>
                    <span className={styles.calendarMonth}>{monthShort}</span>
                    <span className={styles.calendarDay}>{dayNumber}</span>
                  </div>
                  <div className={styles.metaText}>
                    <span className={styles.metaPrimary}>{formattedDate}</span>
                    <span className={styles.metaSecondary}>
                      {formattedTime}
                    </span>
                  </div>
                </div>

                <a
                  href={
                    locationData.placeId
                      ? `https://www.google.com/maps/search/?api=1&query=${locationData.lat || ""},${locationData.lng || ""}&query_place_id=${locationData.placeId}`
                      : "#"
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${styles.metaItem} ${styles.clickableMetaItem}`}
                >
                  <div className={styles.metaIcon}>
                    <FiMapPin size={18} />
                  </div>
                  <div className={styles.metaText}>
                    <span className={styles.metaPrimary}>
                      {event.locationType === "online"
                        ? "Online Event"
                        : name || "Register to See Address"}
                      {event.locationType !== "online" && (
                        <FiArrowUpRight className={styles.linkArrow} />
                      )}
                    </span>
                    {event.locationType !== "online" && (
                      <span className={styles.metaSecondary}>
                        {city}, {state}
                      </span>
                    )}
                  </div>
                </a>
              </div>
            </div>

            {/* Registration Card Component */}
            <RegistrationCard event={event} user={user} />

            {/* About Section */}
            <div className={styles.aboutSection}>
              <div className={styles.sectionTitle}>About</div>
              <div
                className={`${styles.aboutContent} prose prose-invert`}
                dangerouslySetInnerHTML={{
                  __html: event.description || "No description provided.",
                }}
              />
            </div>

            {/* Location Section Component */}
            <EventLocation event={event} locationData={locationData} />
          </div>
        </div>
      </div>
    </div>
  );
}
