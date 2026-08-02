import styles from "./RegistrationCard.module.css";
import { Event } from "@/types/event";
import { FaUserCheck } from "react-icons/fa";
import Link from "next/link";

interface RegistrationCardProps {
  event: Event;
  user: any;
}

export default function RegistrationCard({
  event,
  user,
}: RegistrationCardProps) {
  return (
    <div className={styles.registrationCard}>
      <div className={styles.regHeader}>Registration</div>

      {event.requireApproval && (
        <div className={styles.approvalBanner}>
          <div className={styles.approvalIconWrapper}>
            <FaUserCheck size={18} />
          </div>
          <div className={styles.metaText}>
            <span className={styles.metaPrimary}>Approval Required</span>
            <span className={styles.metaSecondary}>
              Your registration is subject to host approval.
            </span>
          </div>
        </div>
      )}

      <div className={styles.bottomSection}>
        {user ? (
          <>
            <div className={styles.welcomeText}>
              Welcome, {user.name?.split(" ")[0] || "User"}! To join the event,
              please register below.
            </div>
            <div className={styles.userInfo}>
              <div className={styles.userAvatar}>
                {user.name ? user.name.charAt(0).toUpperCase() : ":)"}
              </div>
              <div className={styles.userDetails}>
                <span className={styles.userName}>{user.name}</span>
                <span className={styles.userEmail}>{user.email}</span>
              </div>
            </div>
            <Link
              href={`/${event.slug}/form`}
              className={styles.joinBtn}
              style={{
                textAlign: "center",
              }}
            >
              {event.requireApproval ? "Request to Join" : "Register"}
            </Link>
          </>
        ) : (
          <>
            <div className={styles.welcomeText}>
              Please sign in or register to join this event.
            </div>
            <button className={styles.joinBtn}>Sign In to Register</button>
          </>
        )}
      </div>
    </div>
  );
}
