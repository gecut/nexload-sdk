"use client";

import type { TextFieldClientProps } from "payload";

import { FieldDescription, FieldError, FieldLabel, TextInput, useField } from "@payloadcms/ui";
import { type ChangeEvent, type RefObject, useEffect, useRef } from "react";

import type { ValidatedTextKind } from "../internal/validated-text";

export const ValidatedTextFieldComponent = ({ field, path, readOnly, kind, }: TextFieldClientProps & { kind: ValidatedTextKind }) => {
  const { value, setValue, showError, errorMessage, disabled, } = useField<string>({ path, });
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (!inputRef.current) return;
    inputRef.current.dir = "ltr";
    inputRef.current.inputMode = kind === "mobile" || kind === "landline" ? "tel" : ["nationalCode", "legalId", "postalCode", "card"].includes(kind) ? "numeric" : "text";
  }, [kind]);

  return <TextInput path={path} value={value ?? ""} onChange={(event: ChangeEvent<HTMLInputElement>) => setValue(event.target.value)} inputRef={inputRef as RefObject<HTMLInputElement>} rtl={false} readOnly={readOnly || disabled} showError={showError}
    Label={<FieldLabel label={field.label} path={path} required={field.required} localized={field.localized} htmlFor={`field-${path.replace(/\./g, "__")}`} />}
    Error={<FieldError path={path} message={errorMessage} showError={showError} />}
    Description={<FieldDescription path={path} description={field.admin?.description} />} />;
};
