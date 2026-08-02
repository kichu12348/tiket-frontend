import { Controller } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { FiCheck } from "react-icons/fi";
import { FieldRendererProps } from "../../types";
import styles from "./SelectField.module.css";

export default function SelectField({ field, control }: FieldRendererProps) {
  const choices = Array.isArray(field.options)
    ? (field.options as string[])
    : ((field.options as { choices: string[] } | null)?.choices ?? []);

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
              f.onChange([...values, choice]);
            }
          };

          return (
            <div className={styles.choiceGroup}>
              {choices.map((choice) => (
                <Button
                  key={choice}
                  type="button"
                  variant="ghost"
                  className={`${styles.choiceBtn} ${values.includes(choice) ? styles.choiceBtnActive : ""}`}
                  onClick={() => toggle(choice)}
                >
                  {values.includes(choice) && <FiCheck size={12} />}
                  {choice}
                </Button>
              ))}
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
                {f.value === choice && <FiCheck size={12} />}
                {choice}
              </Button>
            ))}
          </div>
        );
      }}
    />
  );
}
