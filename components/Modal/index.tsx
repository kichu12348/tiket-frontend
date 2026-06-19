import styles from "./Modal.module.css";
import { createPortal } from "react-dom";

import { X } from "lucide-react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  leftAction?: React.ReactNode;
  width?: string | number;
  className?: string;
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  children,
  title,
  leftAction,
  width,
  className = "",
}) => {
  if (!isOpen) return null;

  return createPortal(
    <div className={styles.modalOverlay} onClick={onClose}>
      <div
        className={`${styles.modalContent} ${className}`}
        onClick={(e) => e.stopPropagation()}
        style={width ? { width, maxWidth: "90vw" } : undefined}
      >
        <div
          className={styles.modalHeader}
          style={leftAction ? { justifyContent: "space-between" } : undefined}
        >
          <div className={styles.headerLeft}>
            {leftAction && (
              <div className={styles.leftAction}>{leftAction}</div>
            )}
            {title && (
              <h2
                className={styles.modalTitle}
                style={
                  leftAction
                    ? {
                        position: "absolute",
                        left: "50%",
                        transform: "translateX(-50%)",
                      }
                    : undefined
                }
              >
                {title}
              </h2>
            )}
          </div>
          <button className={styles.closeBtn} onClick={onClose}>
            <X size={18} strokeWidth={2} />
          </button>
        </div>
        <div className={styles.modalBody}>{children}</div>
      </div>
    </div>,
    document.body,
  );
};

export default Modal;
