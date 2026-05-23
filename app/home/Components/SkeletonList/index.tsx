import styles from "./Skeleton.module.css";

export default function SkeletonList({ count = 2 }: { count: number }) {
  return (
    <div className={styles.timelineContainer}>
      {[...Array(count)].map((_, i) => (
        <div key={i} className={styles.timelineRow}>
          <div className={styles.timelineDate}>
            <div
              style={{
                width: 30,
                height: 10,
                background: "var(--gray-900)",
                marginBottom: 4,
              }}
            ></div>
            <div
              style={{
                width: 20,
                height: 20,
                background: "var(--gray-900)",
              }}
            ></div>
          </div>
          <div className={styles.timelineLine}>
            <div className={styles.timelineDot} style={{ opacity: 0.2 }}></div>
          </div>
          <div className={styles.timelineContent}>
            <div className={styles.skeletonCard}>
              <div className={styles.skeletonInfo}>
                <div className={styles.skeletonLine}></div>
                <div className={`${styles.skeletonLine} ${styles.short}`}></div>
                <div
                  className={styles.skeletonIconRow}
                  style={{ marginTop: 24 }}
                >
                  <div className={styles.skeletonIcon}></div>
                  <div className={styles.skeletonIconText}></div>
                </div>
                <div className={styles.skeletonIconRow}>
                  <div className={styles.skeletonIcon}></div>
                  <div className={styles.skeletonIconText}></div>
                </div>
              </div>
              <div className={styles.imagePlaceholder}></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
