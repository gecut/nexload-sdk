/** Payload field types that affect stored data; the only types an entity may compile to. */
export const dataFieldTypes: ReadonlySet<string> = new Set([
  "array",
  "blocks",
  "checkbox",
  "code",
  "date",
  "email",
  "group",
  "join",
  "json",
  "number",
  "point",
  "radio",
  "relationship",
  "richText",
  "select",
  "text",
  "textarea",
  "upload"
]);
