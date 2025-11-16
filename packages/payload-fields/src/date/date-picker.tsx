"use client";

import { useField } from "@payloadcms/ui";
import { useEffect, useState } from "react";
import { DayPicker } from "react-day-picker/persian";
import "react-day-picker/style.css";

import { formatDate } from "./format-date";
import "./index.scss";

import type { DateFieldClientComponent } from "payload";

export const DatePicker: DateFieldClientComponent = ({
  path,
  field: { label, },
}) => {
  const { value, setValue, } = useField<string | null>({ path, });
  const [
    selected,
    setSelected
  ] = useState<Date | undefined>(undefined);

  // init from value (edit mode)
  useEffect(
    () => {
      if (value) {
        setSelected(new Date(value));
      }
    }, [value]
  );

  const handleChange = (date: Date | undefined) => {
    setSelected(date);

    if (date) {
      setValue(date.toISOString());
    }
  };

  return (
    <div className="field-type text jalali-date-field" tabIndex={0}>
      {label && (
        <label className="field-label" htmlFor={path}>
          {String(label)}
        </label>
      )}
      <input
        readOnly
        type="text"
        value={(value && formatDate(value)) ?? undefined}
      />
      <div className="jalali-date-picker">
        <DayPicker
          animate
          captionLayout="dropdown"
          mode="single"
          navLayout="around"
          onSelect={handleChange}
          required={false}
          selected={selected}
          showOutsideDays
        />
        <hr />
        <div className="jalali-date-picker-input">
          <input
            max={59}
            min={0}
            onInput={(e) => {
              if (!selected) return;
              const target = e.target as HTMLInputElement;
              const newDate = new Date(selected);

              newDate.setMinutes(target.valueAsNumber);

              handleChange(newDate);
            }}
            type="number"
            value={selected?.getMinutes() ?? 0}
          />
          <span>:</span>
          <input
            max={23}
            min={0}
            onInput={(e) => {
              if (!selected) return;
              const target = e.target as HTMLInputElement;
              const newDate = new Date(selected);

              newDate.setHours(target.valueAsNumber);

              handleChange(newDate);
            }}
            type="number"
            value={selected?.getHours() ?? 0}
          />
        </div>
      </div>
      {/* {required && !selected && (
        <p className="field-error">لطفا تاریخ را انتخاب کنید</p>
      )} */}
    </div>
  );
};
