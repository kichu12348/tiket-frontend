export interface FormField {
  id: string;
  eventId: string;
  name: string;
  label: string;
  fieldType:
    | "text"
    | "long_text"
    | "email"
    | "phone"
    | "number"
    | "single_select"
    | "multi_select"
    | "radio"
    | "checkbox"
    | "date"
    | "datetime"
    | "time"
    | "rating"
    | "file"
    | "url"
    | "select";
  isRequired: boolean;
  options: string[] | null;
  sortOrder: number;
  page: number;
  createdAt: string;
}

export interface CreateFormFieldPayload {
  name: string;
  label: string;
  fieldType:
    | "text"
    | "long_text"
    | "email"
    | "phone"
    | "number"
    | "single_select"
    | "multi_select"
    | "radio"
    | "checkbox"
    | "date"
    | "datetime"
    | "time"
    | "rating"
    | "file"
    | "url"
    | "select";
  isRequired?: boolean;
  options?: string[] | null;
  sortOrder?: number;
  page?: number;
}

export interface UpdateFormFieldPayload extends Partial<CreateFormFieldPayload> {}
