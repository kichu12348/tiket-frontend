import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import styles from "./Dropdown.module.css";

interface DropdownOption {
  label: string;
  value: string;
}

interface DropdownProps {
  options: DropdownOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export default function Dropdown({
  options,
  value,
  onChange,
  placeholder = "Select an option",
  className,
}: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className={`${styles.container} ${className || ""}`} ref={containerRef}>
      <button
        type="button"
        className={styles.triggerBtn}
        onClick={() => setIsOpen(!isOpen)}
        data-empty={!selectedOption}
      >
        <span>{selectedOption ? selectedOption.label : placeholder}</span>
        <ChevronDown size={16} className={styles.chevron} />
      </button>

      {isOpen && (
        <div className={styles.popover}>
          {options.map((option) => (
            <button
              key={option.value}
              className={`${styles.optionItem} ${
                value === option.value ? styles.selected : ""
              }`}
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
