export const FIELD_TYPES = [
  { label: "Text", value: "text" as const },
  { label: "LongText", value: "long_text" as const },
  { label: "Email", value: "email" as const },
  { label: "Phone", value: "phone" as const },
  { label: "SingleSelect", value: "single_select" as const },
  { label: "MultiSelect", value: "multi_select" as const },
  { label: "Radio", value: "radio" as const },
  { label: "Checkbox", value: "checkbox" as const },
  { label: "Number", value: "number" as const },
  { label: "DateTime", value: "datetime" as const },
  { label: "Date", value: "date" as const },
  { label: "Time", value: "time" as const },
  { label: "Rating", value: "rating" as const },
  { label: "Url", value: "url" as const },
];

export type FieldType = (typeof FIELD_TYPES)[number]["value"] | "select";

export interface LocalField {
  localId: string;
  serverId?: string;
  name: string;
  label: string;
  fieldType: FieldType;
  isRequired: boolean;
  options: string[] | null;
  sortOrder: number;
  page: number;
  isEditing?: boolean;
}

export type StandardFieldStatus = "Required" | "Optional" | "Off";

export interface StandardField {
  name: string;
  icon: React.ReactNode;
  label: string;
  status: StandardFieldStatus;
  serverId?: string;
}
