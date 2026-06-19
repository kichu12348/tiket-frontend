import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";
import styles from "./Dropdown.module.css";

interface DropdownOption<T> {
  label: string;
  value: T;
  desc?: string;
  LeftComponent?: React.ReactNode;
  RightComponent?: React.ReactNode;
}

interface DropdownProps<T> {
  options: DropdownOption<T>[];
  value: string;
  onChange: (value: T) => void;
  placeholder?: string;
  className?: string;
  popoverPosition?: "top" | "bottom";
  popoverAlign?: "left" | "right";
  renderTriggerContent?: (
    selected: DropdownOption<T> | undefined,
  ) => React.ReactNode;
  renderOption?: (
    option: DropdownOption<T>,
    isSelected: boolean,
  ) => React.ReactNode;
  maxHeight?: string;
  alignSelf?: React.CSSProperties["alignSelf"];
  width?: React.CSSProperties["width"];
  btnWidth?: React.CSSProperties["width"];
  btnColor?: React.CSSProperties["backgroundColor"];
}

export default function Dropdown<T>({
  options,
  value,
  onChange,
  placeholder = "Select an option",
  className,
  popoverPosition = "bottom",
  popoverAlign = "left",
  renderTriggerContent,
  renderOption,
  maxHeight,
  alignSelf,
  width = "maxContent",
  btnWidth = "maxContent",
  btnColor,
}: DropdownProps<T>) {
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

  const style: React.CSSProperties = {
    width,
    alignSelf: alignSelf || "unset",
  };

  return (
    <div
      className={`${styles.container} ${className || ""}`}
      ref={containerRef}
      style={style}
    >
      <button
        type="button"
        className={styles.triggerBtn}
        onClick={() => setIsOpen(!isOpen)}
        data-empty={!selectedOption}
        style={{
          width: btnWidth,
          ...(btnColor && { backgroundColor: btnColor }),
        }}
      >
        {renderTriggerContent ? (
          renderTriggerContent(selectedOption)
        ) : (
          <div
            style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}
          >
            {selectedOption?.LeftComponent}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
              }}
            >
              <span>{selectedOption ? selectedOption.label : placeholder}</span>
            </div>
          </div>
        )}
        <ChevronDown
          size={16}
          className={`${styles.chevron} ${isOpen ? styles.chevronOpen : ""}`}
        />
      </button>

      {isOpen && (
        <div
          className={`${styles.popover} ${styles.scrollArea} ${popoverPosition === "top" ? styles.popoverTop : ""} ${popoverAlign === "right" ? styles.alignRight : ""}`}
          style={
            maxHeight ? { maxHeight, overflowY: "auto", width } : { width }
          }
        >
          {options.map((option, index) => {
            const isSelected = value === option.value;
            return (
              <button
                key={`${option.value}-${index}`}
                className={`${styles.optionItem} ${isSelected ? styles.selected : ""}`}
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
              >
                {renderOption ? (
                  renderOption(option, isSelected)
                ) : (
                  <>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.75rem",
                      }}
                    >
                      {option.LeftComponent}
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "flex-start",
                          gap: "0.15rem",
                        }}
                      >
                        <span>{option.label}</span>
                        {option.desc && (
                          <span
                            style={{
                              fontSize: "0.8rem",
                              color: "var(--color-text-secondary)",
                              fontWeight: 400,
                            }}
                          >
                            {option.desc}
                          </span>
                        )}
                      </div>
                    </div>
                    {isSelected && (
                      <Check size={14} className={styles.checkIcon} />
                    )}
                  </>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
