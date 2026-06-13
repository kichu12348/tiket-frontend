"use client";

import { useState, useEffect } from "react";
import {
  getTicketTypes,
  createTicketType,
  updateTicketType,
  deleteTicketType,
} from "@/api/tickets";
import { TicketType } from "@/types/ticketType";
import { toast } from "sonner";
import { Plus, Edit2, Trash2 } from "lucide-react";
import Modal from "@/components/Modal";
import Switch from "@/components/Switch";
import styles from "./TicketTypesPanel.module.css";

interface Props {
  eventId: string;
}

export default function TicketTypesPanel({ eventId }: Props) {
  const [ticketTypes, setTicketTypes] = useState<TicketType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [quantityLimit, setQuantityLimit] = useState("");
  const [isTransferable, setIsTransferable] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchTicketTypes();
  }, [eventId]);

  const fetchTicketTypes = async () => {
    try {
      setIsLoading(true);
      const data = await getTicketTypes(eventId);
      setTicketTypes(data || []);
    } catch (error) {
      console.error("Failed to fetch ticket types", error);
      toast.error("Failed to load ticket types.");
    } finally {
      setIsLoading(false);
    }
  };

  const openModal = (ticket?: TicketType) => {
    if (ticket) {
      setEditingId(ticket.id);
      setName(ticket.name);
      setPrice(ticket.price.toString());
      setQuantityLimit(
        ticket.quantityLimit ? ticket.quantityLimit.toString() : "",
      );
      setIsTransferable(ticket.isTransferable ?? true);
    } else {
      setEditingId(null);
      setName("");
      setPrice("");
      setQuantityLimit("");
      setIsTransferable(true);
    }
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error("Ticket name is required.");
      return;
    }
    if (price === "" || isNaN(Number(price)) || Number(price) < 0) {
      toast.error("Please enter a valid price (0 for free).");
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = {
        name,
        price: Number(price),
        quantityLimit: quantityLimit ? parseInt(quantityLimit, 10) : null,
        isTransferable,
      };

      if (editingId) {
        await updateTicketType(eventId, editingId, payload);
        toast.success("Ticket type updated.");
      } else {
        await createTicketType(eventId, payload);
        toast.success("Ticket type created.");
      }
      setIsModalOpen(false);
      fetchTicketTypes();
    } catch (error) {
      console.error("Failed to save ticket type", error);
      toast.error("Failed to save ticket type.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (ticketId: string) => {
    if (!window.confirm("Are you sure you want to delete this ticket type?"))
      return;
    try {
      await deleteTicketType(eventId, ticketId);
      toast.success("Ticket type deleted.");
      fetchTicketTypes();
    } catch (error) {
      console.error("Failed to delete ticket type", error);
      toast.error("Failed to delete ticket type.");
    }
  };

  if (isLoading) {
    return <div className={styles.loading}>Loading ticket types...</div>;
  }

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <h3 className={styles.title}>Ticket Types</h3>
        <button className={styles.addBtn} onClick={() => openModal()}>
          <Plus size={16} />
          <span>Add Ticket</span>
        </button>
      </div>

      <div className={styles.list}>
        {ticketTypes.length === 0 ? (
          <div className={styles.empty}>No ticket types created yet.</div>
        ) : (
          ticketTypes.map((ticket) => (
            <div key={ticket.id} className={styles.ticketCard}>
              <div className={styles.ticketInfo}>
                <div className={styles.ticketHeader}>
                  <span className={styles.ticketName}>{ticket.name}</span>
                  <span className={styles.ticketPrice}>
                    {Number(ticket.price) === 0 ? "Free" : `$${ticket.price}`}
                  </span>
                </div>
                <div className={styles.ticketMeta}>
                  {ticket.quantityLimit
                    ? `Limit: ${ticket.quantityLimit}`
                    : "Unlimited"}
                  {ticket.isTransferable
                    ? " • Transferable"
                    : " • Non-transferable"}
                </div>
              </div>
              <div className={styles.ticketActions}>
                <button
                  className={styles.iconBtn}
                  onClick={() => openModal(ticket)}
                >
                  <Edit2 size={16} />
                </button>
                <button
                  className={styles.iconBtnDanger}
                  onClick={() => handleDelete(ticket.id)}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingId ? "Edit Ticket Type" : "Create Ticket Type"}
      >
        <div className={styles.form}>
          <div className={styles.formGroup}>
            <label>Ticket Name</label>
            <input
              type="text"
              className={styles.input}
              placeholder="e.g. General Admission"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className={styles.formGroup}>
            <label>Price ($)</label>
            <input
              type="number"
              className={styles.input}
              placeholder="0.00 for free"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              min="0"
              step="0.01"
            />
          </div>
          <div className={styles.formGroup}>
            <label>Quantity Limit</label>
            <input
              type="number"
              className={styles.input}
              placeholder="Leave empty for unlimited"
              value={quantityLimit}
              onChange={(e) => setQuantityLimit(e.target.value)}
              min="1"
            />
          </div>
          <div className={styles.formRow}>
            <label>Allow Transfers</label>
            <Switch checked={isTransferable} onChange={setIsTransferable} />
          </div>
          <button
            className={styles.saveBtn}
            onClick={handleSave}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Saving..." : "Save Ticket Type"}
          </button>
        </div>
      </Modal>
    </div>
  );
}
