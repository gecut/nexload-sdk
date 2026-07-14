"use client";

import {
  Button, FieldLabel, TextInput, useConfig, useField, useForm, useFormFields
} from "@payloadcms/ui";
import { useCallback, useMemo, useState } from "react";

import type { TextFieldClientProps } from "payload";

type Props = { source: string, lockName: string, generator?: string };

export const SlugFieldComponent = ({
  field, path, source, lockName, generator, readOnly,
}: TextFieldClientProps & Props) => {
  const { value, setValue, } = useField<string>({ path, });
  const { getDataByPath, dispatchFields, } = useForm();
  const { config, } = useConfig();
  const [
    busy,
    setBusy
  ] = useState(false);
  const parent = useMemo(
    () => (path ?? field.name).split(".").slice(
      0, -1
    ), [
      field.name,
      path
    ]
  );
  const lockPath = [
    ...parent,
    lockName
  ].join(".");
  const locked = useFormFields(([fields]) => Boolean(fields[lockPath]?.value));
  const generate = useCallback(
    async () => {
      const sourceValue = getDataByPath(source) as string | undefined;
      if (!generator || !sourceValue) return;
      setBusy(true);
      try {
        const response = await fetch(
          `${config.serverURL}${config.routes.api}/payload-fields/generate-slug`, {
            method: "POST",
            headers: { "Content-Type": "application/json", },
            body: JSON.stringify({ generator, sourceValue, currentSlug: value, }),
          }
        );
        const payload = await response.json() as { slug?: string, error?: { message?: string } };
        if (!response.ok || typeof payload.slug !== "string") throw new Error(payload.error?.message ?? "تولید اسلاگ با خطا مواجه شد.");
        setValue(payload.slug);
      } finally { setBusy(false); }
    }, [
      config.routes.api,
      config.serverURL,
      generator,
      getDataByPath,
      setValue,
      source,
      value
    ]
  );
  return (
    <div className="field-type slug-field-component">
      <FieldLabel htmlFor={`field-${path}`} label={field.label} />
      <div>
        <TextInput
          onChange={setValue} path={path} readOnly={Boolean(readOnly || locked)}
          value={value}
        />
        <Button
          buttonStyle="none" disabled={!generator || busy || readOnly} onClick={() => void generate()}
          type="button"
        >
          تولید اسلاگ
        </Button>
        <Button
          buttonStyle="none" disabled={readOnly} onClick={() => dispatchFields({ type: "UPDATE", path: lockPath, value: !locked, })}
          type="button"
        >
          {locked ? "قفل" : "ویرایش"}
        </Button>
      </div>
    </div>
  );
};
