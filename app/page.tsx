import styles from "./LandingPage.module.css";
import GlassmorphismTicket from "./Ticket";
import { FiArrowRight } from "react-icons/fi";
import Link from "next/link";

export default function Home() {
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.logo}>
          Tiket<span className={styles.dot}>.</span>
        </div>
        <Link href="/signin" className={styles.signInBtn}>
          Sign In
        </Link>
      </header>

      <main className={styles.mainContent}>
        <div className={styles.leftColumn}>
          <h1 className={styles.title}>
            Less time managing.
            <br />
            More time <span>experiencing.</span>
          </h1>
          <p className={styles.description}>
            Create, manage and sell tickets for any kind of event.
            <br />
            All the tools you need. None of the clutter.
          </p>

          <div className={styles.ctaGroup}>
            <button className={styles.primaryBtn}>
              Create Event <FiArrowRight size={20} />
            </button>
          </div>
        </div>

        <div className={styles.rightColumn}>
          <div className={styles.ticketWrapper}>
            <GlassmorphismTicket />
          </div>
        </div>
      </main>
    </div>
  );
}
