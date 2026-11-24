"use client";

import type { DateFieldClientProps } from "payload";

import {
  FieldDescription,
  FieldError,
  FieldLabel,
  useField,
  useTranslation,
} from "@payloadcms/ui";
import { useCallback, useState } from "react";
import "react-day-picker/style.css";
import { DayPicker, enUS, faIR } from "react-day-picker/persian";

import {
  formatJalaliPattern,
  gregorianToJalali,
  jalaliToGregorian,
  parseJalaliDate,
  TEHRAN_TIME_ZONE,
  toJalali,
} from "@nexload-sdk/persian/date";

import type { JalaliPickerAppearance } from "../date/picker-types";

import { formatJalaliDate, type JalaliDateDisplayOptions } from "../date/format-date";
import { toStoredJalaliInstant } from "../date/index";
import { resolveLanguage, t } from "../i18n/messages";

type Props = {
  appearance: JalaliPickerAppearance
  display: JalaliDateDisplayOptions
  timeZone?: string
};

type Draft = { text: string, value: string | null | undefined, invalid: boolean };

function parseInput (
  text: string, appearance: JalaliPickerAppearance, timeZone: string, currentDay: string | null
): string | null {
  const [dayText, timeText, extra] = text.trim().split(/\s+/);
  const day = appearance === "timeOnly" ? currentDay : dayText;
  const time = appearance === "timeOnly" ? dayText : timeText;

  if (extra || !day || (appearance === "timeOnly" && timeText)) return null;
  const hasTime = appearance === "dayAndTime" || appearance === "timeOnly";

  if (hasTime !== Boolean(time)) return null;

  // Month-only input needs calendar parts before applying the target timezone.
  const parsed = parseJalaliDate(day, { timeZone: appearance === "monthOnly" ? "UTC" : timeZone, time, });

  if (!parsed) return null;

  return appearance === "monthOnly"
    ? toStoredJalaliInstant(toJalali(parsed, { timeZone: "UTC", }), appearance, timeZone)
    : parsed.toISOString();
}

export const JalaliDateFieldComponent = ({
  field, path: providedPath, appearance, display, timeZone = display.timeZone ?? TEHRAN_TIME_ZONE, readOnly,
}: DateFieldClientProps & Props) => {
  const { i18n, } = useTranslation();
  const lang = resolveLanguage(i18n.language);
  const invalidMessage = t(lang, "date.invalid");
  const [draft, setDraft] = useState<Draft | null>(null);
  const validate = useCallback(
    (currentValue: string | null | undefined) => draft?.invalid && draft.value === currentValue ? invalidMessage : true,
    [draft, invalidMessage]
  );
  const { value, setValue, path, showError, errorMessage, disabled, } = useField<string | null>({
    potentiallyStalePath: providedPath,
    validate,
  });

  const locked = readOnly || disabled;
  const dateFormat = "yyyy/MM/dd";
  const timeFormat = "HH:mm";
  const pattern = appearance === "timeOnly" ? timeFormat : appearance === "dayAndTime" ? `${dateFormat} ${timeFormat}` : dateFormat;
  const dateText = formatJalaliPattern(value, dateFormat, { timeZone, });
  const parts = value && dateText ? toJalali(value, { timeZone, }) : undefined;
  const gregorian = parts ? jalaliToGregorian(parts.year, parts.month, parts.day) : undefined;
  // DayPicker uses browser-local dates to represent calendar days.
  const selected = gregorian ? new Date(gregorian.year, gregorian.month - 1, gregorian.day, 12) : undefined;
  const activeDraft = draft?.value === value ? draft : null;
  const invalid = !locked && activeDraft?.invalid;
  const text = readOnly
    ? formatJalaliDate(value, display) ?? ""
    : activeDraft?.text ?? formatJalaliPattern(value, pattern, { timeZone, digits: display.digits, }) ?? "";
  const inputId = `field-${path.replace(/\./g, "__")}`;
  const errorId = `${inputId}-invalid`;

  const chooseDay = (date: Date | undefined) => {
    setDraft(null);

    if (!date) {
      setValue(null);

      return;
    }

    const picked = gregorianToJalali(date.getFullYear(), date.getMonth() + 1, date.getDate());
    setValue(toStoredJalaliInstant({ ...picked, hour: parts?.hour, minute: parts?.minute, }, appearance, timeZone));
  };

  return (
    <div className={`field-type jalali-date-field${showError || invalid ? " error" : ""}`}>
      <FieldLabel htmlFor={inputId} label={field.label} localized={field.localized} path={path} required={field.required} />
      <FieldError message={errorMessage} path={path} showError={showError} />
      <input
        aria-describedby={invalid ? errorId : undefined}
        aria-invalid={Boolean(invalid || showError)}
        dir="ltr"
        id={inputId}
        onBlur={() => {
          if (!activeDraft?.invalid) setDraft(null);
        }}
        onChange={(event) => {
          const input = event.target.value;

          if (!input.trim()) {
            setDraft(null);
            setValue(null);

            return;
          }

          const currentDay = appearance === "timeOnly" ? dateText ?? formatJalaliPattern(new Date(), dateFormat, { timeZone, }) : null;
          const instant = parseInput(input, appearance, timeZone, currentDay);
          setDraft({ text: input, value: instant ?? value, invalid: instant === null, });
          if (instant !== null || !activeDraft?.invalid) setValue(instant ?? value);
        }}
        placeholder={pattern}
        readOnly={locked}
        type="text"
        value={text}
      />
      {invalid && <p id={errorId} role="alert">{invalidMessage}</p>}
      <FieldDescription description={field.admin?.description} path={path} />
      {appearance !== "timeOnly" && (
        <DayPicker
          captionLayout="dropdown"
          defaultMonth={selected}
          dir={lang === "fa" ? "rtl" : "ltr"}
          disabled={locked}
          locale={lang === "fa" ? faIR : enUS}
          mode="single"
          numerals={display.digits === "latin" ? "latn" : "arabext"}
          onSelect={locked ? undefined : chooseDay}
          selected={selected}
          showOutsideDays
        />
      )}
      {!locked && (value || activeDraft) && (
        <button onClick={() => chooseDay(undefined)} type="button">{t(lang, "ui.clear")}</button>
      )}
    </div>
  );
};
