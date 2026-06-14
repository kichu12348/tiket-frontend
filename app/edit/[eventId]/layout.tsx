"use client";

import { useEffect } from "react";
import { useParams, useRouter, usePathname } from "next/navigation";
import SidebarNav from "@/components/SidebarNav";
import { getEvent } from "@/api/events";
import { useEventStore } from "@/store/useEventStore";
import SkeletonLoader from "./components/SkeletonLoader";
import styles from "./EditLayout.module.css";
import { toast } from "sonner";

export default function EditEventLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();
  const router = useRouter();
  const pathname = usePathname();
  const eventId = params.eventId as string;

  const { setEvent, isLoading, setIsLoading } = useEventStore();

  useEffect(() => {
    const fetchEvent = async () => {
      if (!eventId) return;

      try {
        setIsLoading(true);
        const eventData = await getEvent(eventId);
        setEvent(eventData);
      } catch (error) {
        console.error("Failed to fetch event data", error);
        toast.error("Failed to load event data.");
        router.push("/home");
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvent();
  }, [eventId, setEvent, setIsLoading, router]);

  const isDetailsPage = pathname?.endsWith("/details");

  if (isLoading) {
    return (
      <div className={styles.layout}>
        <div className={styles.background} />
        {!isDetailsPage && <SidebarNav eventId={eventId} />}
        <main className={styles.mainContent}>
          <SkeletonLoader />
        </main>
      </div>
    );
  }

  return (
    <div className={styles.layout}>
      <div className={styles.background} />
      {!isDetailsPage && <SidebarNav eventId={eventId} />}
      <main className={styles.mainContent}>{children}</main>
    </div>
  );
}
