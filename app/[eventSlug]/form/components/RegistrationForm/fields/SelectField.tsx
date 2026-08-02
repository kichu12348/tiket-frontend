import { Controller } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { FieldRendererProps } from "../types";
import styles from "./SelectField.module.css";

export default function SelectField({ field, control }: FieldRendererProps) {
  const optionsObj = (
    field.options && typeof field.options === "object" && !Array.isArray(field.options)
      ? field.options
      : null
  ) as { choices?: string[]; min?: number | null; max?: number | null } | null;

  const choices = Array.isArray(field.options)
    ? (field.options as string[])
    : (optionsObj?.choices ?? []);

  const choicesCount = choices.length;
  const rawMin = optionsObj?.min ?? null;
  const rawMax = optionsObj?.max ?? null;

  const min = rawMin != null && rawMin > 0 ? (choicesCount > 0 ? Math.min(rawMin, choicesCount) : rawMin) : null;
  const max = rawMax != null && rawMax > 0 ? (choicesCount > 0 ? Math.min(rawMax, choicesCount) : rawMax) : null;

  const isMulti =
    field.fieldType === "multi_select" || field.fieldType === "checkbox";

  return (
    <Controller
      name={field.id}
      control={control}
      defaultValue={isMulti ? [] : ""}
      render={({ field: f }) => {
        if (isMulti) {
          const values: string[] = Array.isArray(f.value) ? f.value : [];

          const toggle = (choice: string) => {
            if (values.includes(choice)) {
              f.onChange(values.filter((v) => v !== choice));
            } else {
              if (max != null && max > 0 && values.length >= max) {
                return;
              }
              f.onChange([...values, choice]);
            }
          };

          const isMaxReached = max != null && max > 0 && values.length >= max;

          let metaText = "";
          if (min != null && max != null) {
            metaText = `Select ${min} to ${max} options (${values.length} selected)`;
          } else if (min != null && min > 0) {
            metaText = `Select at least ${min} option${min > 1 ? "s" : ""} (${values.length} selected)`;
          } else if (max != null && max > 0) {
            metaText = `Select up to ${max} option${max > 1 ? "s" : ""} (${values.length}/${max} selected)`;
          }

          return (
            <div className={styles.container}>
              {metaText && <span className={styles.selectionMeta}>{metaText}</span>}
              <div className={styles.choiceGroup}>
                {choices.map((choice) => {
                  const isSelected = values.includes(choice);
                  const isDisabled = !isSelected && isMaxReached;

                  return (
                    <Button
                      key={choice}
                      type="button"
                      variant="ghost"
                      disabled={isDisabled}
                      className={`${styles.choiceBtn} ${isSelected ? styles.choiceBtnActive : ""} ${isDisabled ? styles.choiceBtnDisabled : ""}`}
                      onClick={() => toggle(choice)}
                    >
                      {isSelected && <Check size={14} />}
                      {choice}
                    </Button>
                  );
                })}
              </div>
            </div>
          );
        }

        return (
          <div className={styles.choiceGroup}>
            {choices.map((choice) => (
              <Button
                key={choice}
                type="button"
                variant="ghost"
                className={`${styles.choiceBtn} ${f.value === choice ? styles.choiceBtnActive : ""}`}
                onClick={() => f.onChange(choice)}
              >
                {f.value === choice && <Check size={14} />}
                {choice}
              </Button>
            ))}
          </div>
        );
      }}
    />
  );
}
