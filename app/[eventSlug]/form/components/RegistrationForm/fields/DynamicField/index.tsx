import { FieldRendererProps } from "../../types";
import RatingField from "../RatingField";
import SelectField from "../SelectField";
import InputField from "../InputField";

const SELECT_TYPES = new Set([
  "single_select",
  "multi_select",
  "radio",
  "select",
  "checkbox",
]);

export default function DynamicField(props: FieldRendererProps) {
  const { field } = props;

  if (SELECT_TYPES.has(field.fieldType)) {
    return <SelectField {...props} />;
  }

  if (field.fieldType === "rating") {
    return <RatingField {...props} />;
  }

  // Default: text, email, phone, number, date, datetime, time, url, long_text
  return <InputField {...props} />;
}
