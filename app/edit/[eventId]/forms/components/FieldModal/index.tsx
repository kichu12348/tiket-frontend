import React, { useState, useEffect, useRef } from "react";
import {
  ChevronLeft,
  Type,
  AlignLeft,
  List,
  CheckSquare,
  Calendar,
  Mail,
  Hash,
  X,
  Trash2,
  Phone,
  ChevronDown,
  CircleDot,
  CalendarClock,
  Clock,
  Star,
  Link,
} from "lucide-react";
import Modal from "@/components/Modal";
import Switch from "@/components/Switch";
import { LocalField, FieldType, FIELD_TYPES } from "../../types";
import styles from "./FieldModal.module.css";
import { toast } from "sonner";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  mode: "add" | "edit";
  initialField?: LocalField | null;
  onSave: (field: Omit<LocalField, "isEditing" | "localId">) => Promise<void>;
  onDelete?: () => Promise<void>;
}

const TYPE_ICONS: Record<string, React.ReactNode> = {
  text: <Type size={18} />,
  long_text: <AlignLeft size={18} />,
  email: <Mail size={18} />,
  phone: <Phone size={18} />,
  single_select: <ChevronDown size={18} />,
  multi_select: <List size={18} />,
  radio: <CircleDot size={18} />,
  checkbox: <CheckSquare size={18} />,
  number: <Hash size={18} />,
  datetime: <CalendarClock size={18} />,
  date: <Calendar size={18} />,
  time: <Clock size={18} />,
  rating: <Star size={18} />,
  url: <Link size={18} />,
  select: <List size={18} />,
};

const TYPE_DESCRIPTIONS: Record<string, string> = {
  text: "Ask for a free-form response",
  long_text: "Ask for a multi-line response",
  email: "Ask for an email address",
  phone: "Ask for a phone number",
  single_select: "Let the guest choose one option from a list",
  multi_select: "Let the guest choose multiple options",
  radio: "Let the guest choose one option via radio buttons",
  checkbox: "Ask guests to check a box",
  number: "Ask for a numerical value",
  datetime: "Ask guests for a specific date and time",
  date: "Ask guests for a specific date",
  time: "Ask guests for a specific time",
  rating: "Ask guests for a rating out of 5",
  url: "Ask guests for a website link",
  select: "Let the guest choose from a list of options",
};

export default function FieldModal({
  isOpen,
  onClose,
  mode,
  initialField,
  onSave,
  onDelete,
}: Props) {
  const [step, setStep] = useState<"type" | "details">("type");
  const [fieldType, setFieldType] = useState<FieldType>("text");
  const [label, setLabel] = useState("");
  const [isRequired, setIsRequired] = useState(false);

  const [options, setOptions] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [isBulkAdding, setIsBulkAdding] = useState(false);
  const [bulkInput, setBulkInput] = useState("");

  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const tagInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      if (mode === "edit" && initialField) {
        setStep("details");
        setFieldType(initialField.fieldType);
        setLabel(initialField.label);
        setIsRequired(initialField.isRequired);
        setOptions(initialField.options || []);
      } else {
        setStep("type");
        setFieldType("text");
        setLabel("");
        setIsRequired(false);
        setOptions([]);
        setTagInput("");
        setIsBulkAdding(false);
        setBulkInput("");
      }
    }
  }, [isOpen, mode, initialField]);

  const handleTypeSelect = (type: FieldType) => {
    setFieldType(type);
    setStep("details");
  };

  const handleBulkAdd = () => {
    if (!bulkInput.trim()) return;

    let newOptions: string[] = [];
    try {
      const parsed = JSON.parse(bulkInput);
      if (Array.isArray(parsed)) {
        newOptions = parsed.map(String);
      } else {
        throw new Error("Not an array");
      }
    } catch {
      newOptions = bulkInput.split(",").map(s => s.trim()).filter(Boolean);
    }
    
    if (newOptions.length > 0) {
      const uniqueOptions = Array.from(new Set([...options, ...newOptions]));
      const addedCount = uniqueOptions.length - options.length;
      setOptions(uniqueOptions);
      setBulkInput("");
      setIsBulkAdding(false);
      toast.success(`Added ${addedCount} new options.`);
    } else {
      toast.error("No valid options found to add.");
    }
  };

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === "Tab") {
      e.preventDefault();
      const val = tagInput.trim();
      if (val && !options.includes(val)) {
        setOptions([...options, val]);
        setTagInput("");
      }
    }
  };

  const removeTag = (index: number) => {
    setOptions(options.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!label.trim()) {
      toast.error("Question text is required.");
      return;
    }
    const needsOptions = [
      "single_select",
      "multi_select",
      "radio",
      "select",
    ].includes(fieldType);
    if (needsOptions && options.length === 0) {
      toast.error("At least one option is required.");
      return;
    }

    setIsSaving(true);
    try {
      const finalName =
        initialField?.name || label.toLowerCase().replace(/\s+/g, "_");

      await onSave({
        name: finalName,
        label: label.trim(),
        fieldType,
        isRequired,
        options: needsOptions ? options : null,
        sortOrder: initialField?.sortOrder || 0,
        page: initialField?.page || 1,
      });
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteClick = async () => {
    if (onDelete && confirm("Are you sure you want to delete this question?")) {
      setIsDeleting(true);
      try {
        await onDelete();
        onClose();
      } finally {
        setIsDeleting(false);
      }
    }
  };

  if (!isOpen) return null;

  const typeConfig = FIELD_TYPES.find((t) => t.value === fieldType);

  const leftAction =
    step === "details" && mode === "add" ? (
      <button className={styles.backBtn} onClick={() => setStep("type")}>
        <ChevronLeft size={18} />
      </button>
    ) : undefined;

  const title =
    step === "type"
      ? "Add Question"
      : mode === "add"
        ? "Add Question"
        : "Edit Question";

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      leftAction={leftAction}
      width={465}
      className={styles.modalContent}
    >
      {step === "type" ? (
        <>
          <p className={styles.modalSubtitle}>
            Ask guests custom questions when they register.
          </p>
          <div className={styles.typeGrid}>
            {FIELD_TYPES.map((type) => (
              <button
                key={type.value}
                className={styles.typeBtn}
                onClick={() => handleTypeSelect(type.value as FieldType)}
              >
                <div className={styles.typeIcon}>
                  {TYPE_ICONS[type.value] || <Type size={18} />}
                </div>
                {type.label}
              </button>
            ))}
          </div>
        </>
      ) : (
        <div className={styles.formBody}>
          {/* Type summary card */}
          <div className={styles.selectedTypeCard}>
            <div className={styles.selectedTypeIcon}>
              {TYPE_ICONS[fieldType] || <Type size={20} />}
            </div>
            <div className={styles.selectedTypeText}>
              <h3>{typeConfig?.label}</h3>
              <p>{TYPE_DESCRIPTIONS[fieldType] || "Custom question"}</p>
            </div>
          </div>

          {/* Question input */}
          <div className={styles.formGroup}>
            <label>Question</label>
            <input
              type="text"
              className={styles.input}
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              autoFocus
              multiple
            />
          </div>

          {["single_select", "multi_select", "radio", "select"].includes(
            fieldType,
          ) && (
            <div className={styles.formGroup}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <label style={{ margin: 0 }}>Options</label>
                <button
                  type="button"
                  className={styles.bulkAddBtn}
                  onClick={() => setIsBulkAdding(!isBulkAdding)}
                >
                  {isBulkAdding ? "Done" : "Bulk Add"}
                </button>
              </div>
              
              {isBulkAdding ? (
                <div className={styles.bulkAddContainer}>
                  <textarea
                    className={styles.bulkAddTextarea}
                    placeholder="Paste comma-separated values or a JSON array here..."
                    value={bulkInput}
                    onChange={(e) => setBulkInput(e.target.value)}
                    rows={4}
                  />
                  <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "0.5rem" }}>
                    <button type="button" className={styles.submitBtn} style={{ padding: "0.4rem 0.75rem", fontSize: "0.85rem", flex: "none" }} onClick={handleBulkAdd}>
                      Process Options
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  className={styles.tagInputWrapper}
                  onClick={() => tagInputRef.current?.focus()}
                >
                  {options.map((opt, i) => (
                    <span key={i} className={styles.tag}>
                      {opt}
                      <button
                        className={styles.removeTagBtn}
                        onClick={(e) => {
                          e.stopPropagation();
                          removeTag(i);
                        }}
                      >
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                  <input
                    ref={tagInputRef}
                    type="text"
                    className={styles.tagInput}
                    placeholder={options.length === 0 ? "Add options" : ""}
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleAddTag}
                  />
                </div>
              )}
              {!isBulkAdding && (
                <p className={styles.hint}>
                  Press Enter or Tab key to add a new option.
                </p>
              )}
            </div>
          )}

          {/* Required toggle */}
          <div className={styles.switchRow}>
            <span>Required</span>
            <Switch checked={isRequired} onChange={setIsRequired} />
          </div>

          {/* Submit + Delete */}
          <div className={styles.footer}>
            <button
              className={styles.submitBtn}
              onClick={handleSubmit}
              disabled={isSaving || isDeleting}
            >
              {isSaving
                ? "Saving..."
                : mode === "add"
                  ? "Add Question"
                  : "Save Changes"}
            </button>
            {mode === "edit" && onDelete && (
              <button
                className={styles.deleteBtn}
                onClick={handleDeleteClick}
                disabled={isDeleting || isSaving}
                title="Delete Question"
              >
                <Trash2 size={18} />
              </button>
            )}
          </div>
        </div>
      )}
    </Modal>
  );
}
