import React from "react";
import { AlertCircle } from "lucide-react";
import styles from "./PassError.module.css";

interface PassErrorProps {
  message?: string;
}

export function PassError({ message }: PassErrorProps) {
  return (
    <div className={styles.errorCard}>
      <div className={styles.iconWrapper}>
        <AlertCircle size={24} />
      </div>
      <h2 className={styles.title}>Ticket Pass Not Found</h2>
      <p className={styles.description}>
        {message || "The ticket pass you are looking for does not exist or has expired."}
      </p>
    </div>
  );
}
