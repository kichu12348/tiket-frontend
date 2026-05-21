import styles from "./page.module.css";
import GlassmorphismTicket from "./components/Ticket";
import { FiArrowRight } from "react-icons/fi";

export default function Home() {
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.logo}>
          Tiket<span className={styles.dot}>.</span>
        </div>
        <button className={styles.signInBtn}>Sign In</button>
      </header>

      <main className={styles.mainContent}>
        <div className={styles.leftColumn}>
          <h1 className={styles.title}>
            Events,<br />
            made simple.<br />
            Memories,<br />
            made <span>unforgettable.</span>
          </h1>
          <p className={styles.description}>
            Create, manage and sell tickets for any kind of event.<br />
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
            <GlassmorphismTicket size="100%" />
          </div>
        </div>
      </main>
    </div>
  );
}
