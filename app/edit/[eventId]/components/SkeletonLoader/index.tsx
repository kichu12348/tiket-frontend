import styles from "./SkeletonLoader.module.css";
import editStyles from "../../EditLayout.module.css";

export default function SkeletonLoader() {
  return (
    <div className={editStyles.page}>
      <div className={editStyles.container}>
        {/* Left Pane */}
        <div className={editStyles.leftPane}>
          <div className={`${styles.skeleton} ${styles.imageBlock}`} />
          <div className={`${styles.skeleton} ${styles.fontPickerBlock}`} />
        </div>

        {/* Right Pane */}
        <div className={editStyles.rightPane}>
          <div className={`${styles.skeleton} ${styles.toggleBlock}`} />
          <div className={`${styles.skeleton} ${styles.titleBlock}`} />

          {/* Event Date & Time */}
          <div className={`${styles.skeleton} ${styles.labelBlock}`} />
          <div className={`${styles.skeleton} ${styles.contentBlock}`} />

          {/* Registration Period */}
          <div className={`${styles.skeleton} ${styles.labelBlock}`} />
          <div className={`${styles.skeleton} ${styles.contentBlock}`} />

          {/* Location */}
          <div className={`${styles.skeleton} ${styles.labelBlock}`} />
          <div
            className={`${styles.skeleton} ${styles.contentBlockLocation}`}
          />

          {/* Description */}
          <div className={`${styles.skeleton} ${styles.labelBlock}`} />
          <div
            className={`${styles.skeleton} ${styles.contentBlockDescription}`}
          />

          {/* Event Options */}
          <div className={`${styles.skeleton} ${styles.labelBlockOptions}`} />
          <div className={`${styles.skeleton} ${styles.contentBlockOptions}`} />

          {/* Update Button */}
          <div className={`${styles.skeleton} ${styles.buttonBlock}`} />
        </div>
      </div>
    </div>
  );
}
