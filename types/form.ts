export interface FormField {
  id: string;
  eventId: string;
  name: string;
  label: string;
  fieldType: "text" | "email" | "number" | "select" | "checkbox" | "date";
  isRequired: boolean;
  options: string[] | null;
  sortOrder: number;
  createdAt: string;
}

export interface CreateFormFieldPayload {
  name: string;
  label: string;
  fieldType: "text" | "email" | "number" | "select" | "checkbox" | "date";
  isRequired?: boolean;
  options?: string[] | null;
  sortOrder?: number;
}

export interface UpdateFormFieldPayload extends Partial<CreateFormFieldPayload> {}
