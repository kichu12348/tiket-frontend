import styles from "./Skeleton.module.css";

export default function SkeletonList({ count = 2 }: { count: number }) {
  return (
    <div className={styles.timeline}>
      <div className={styles.group}>
        {/* Rail with dot + line */}
        <div className={styles.rail}>
          <span className={styles.dot} />
          <div className={styles.line} />
        </div>

        {/* Group Content (Date Header + Cards) */}
        <div className={styles.groupContent}>
          <div className={styles.dateHeader}>
            <div className={styles.skeletonDateLabel} />
            <div className={styles.skeletonWeekday} />
          </div>

          <div className={styles.cards}>
            {[...Array(count)].map((_, i) => (
              <div key={i} className={styles.skeletonCard}>
                <div className={styles.skeletonInfo}>
                  <div className={styles.skeletonLine}></div>
                  <div className={`${styles.skeletonLine} ${styles.short}`}></div>
                  
                  <div className={styles.skeletonMetaGroup}>
                    <div className={styles.skeletonIconRow}>
                      <div className={styles.skeletonIcon}></div>
                      <div className={styles.skeletonIconText}></div>
                    </div>
                    <div className={styles.skeletonIconRow}>
                      <div className={styles.skeletonIcon}></div>
                      <div className={styles.skeletonIconText}></div>
                    </div>
                  </div>
                </div>
                <div className={styles.imagePlaceholder}></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
