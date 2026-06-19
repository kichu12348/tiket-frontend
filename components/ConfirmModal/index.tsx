import React from "react";
import Modal from "@/components/Modal";
import styles from "./ConfirmModal.module.css";

export interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string | React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  isConfirming?: boolean;
  danger?: boolean;
  width?: number | string;
}

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  isConfirming = false,
  danger = true,
  width = 400,
}: ConfirmModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={() => !isConfirming && onClose()}
      title={title}
      width={width}
    >
      <div className={styles.body}>
        <div className={styles.message}>{message}</div>
        <div className={styles.footer}>
          <button
            className={styles.cancelBtn}
            onClick={onClose}
            disabled={isConfirming}
          >
            {cancelText}
          </button>
          <button
            className={danger ? styles.dangerBtn : styles.primaryBtn}
            onClick={onConfirm}
            disabled={isConfirming}
          >
            {isConfirming ? "Processing..." : confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
}
