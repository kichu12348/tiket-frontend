import styles from "./page.module.css";

export default function Home() {
  return (
    <main className={styles.main}>
      <h1 className={styles.title}>Welcome to Tiket!</h1>
      <p className={styles.description}>
        Your one-stop solution for event pages and ticketing.
      </p>
    </main>
  );
}
