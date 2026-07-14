"use client";

import { FieldLabel, useField } from "@payloadcms/ui";
import { useEffect, useState } from "react";
import { DayPicker } from "react-day-picker/persian";
import "react-day-picker/style.css";

import { formatJalaliDate, type JalaliDateDisplayOptions } from "../date/format-date";

import type { DateFieldClientProps } from "payload";

type Props = { appearance: "dayOnly" | "dayAndTime" | "timeOnly" | "monthOnly", display: JalaliDateDisplayOptions };

export const JalaliDateFieldComponent = ({
  field, path, appearance, display, readOnly,
}: DateFieldClientProps & Props) => {
  const { value, setValue, } = useField<string | null>({ path, });
  const [
    selected,
    setSelected
  ] = useState<Date | undefined>();
  useEffect(
    () => setSelected(value ? new Date(value) : undefined), [value]
  );
  const save = (date: Date | undefined) => {
    setSelected(date);
    setValue(date ? date.toISOString() : null);
  };
  const chooseDay = (date: Date | undefined) => {
    if (!date) return save(undefined);
    const result = new Date(date);
    if (appearance === "dayOnly" || appearance === "monthOnly") result.setHours(
      12, 0, 0, 0
    );
    if (appearance === "monthOnly") result.setDate(1);
    save(result);
  };
  const updateTime = (
    part: "hours" | "minutes", raw: string
  ) => {
    const base = selected ? new Date(selected) : new Date();
    base[part === "hours" ? "setHours" : "setMinutes"](Number(raw));
    save(base);
  };
  const showCalendar = appearance !== "timeOnly";
  const showTime = appearance === "dayAndTime" || appearance === "timeOnly";
  return (
    <div className="field-type jalali-date-field">
      <FieldLabel htmlFor={`field-${path}`} label={field.label} required={field.required} />
      <input
        readOnly value={formatJalaliDate(
          value, display
        ) ?? ""}
      />
      {showCalendar && <DayPicker
        captionLayout="dropdown" disabled={readOnly} mode="single"
        onSelect={chooseDay} selected={selected} showOutsideDays
      />}
      {showTime && (
        <div>
          <input
            disabled={readOnly} max={23} min={0}
            onChange={(event) => updateTime(
              "hours", event.target.value
            )} type="number" value={selected?.getHours() ?? 0}
          />
          <span aria-hidden="true">:</span>
          <input
            disabled={readOnly} max={59} min={0}
            onChange={(event) => updateTime(
              "minutes", event.target.value
            )} type="number" value={selected?.getMinutes() ?? 0}
          />
        </div>
      )}
      {!readOnly && value && <button onClick={() => save(undefined)} type="button">پاک کردن</button>}
    </div>
  );
};
