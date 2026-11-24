"use client";

import type { NumberFieldClientProps } from "payload";

import { FieldDescription, FieldError, FieldLabel, useField } from "@payloadcms/ui";
import { useEffect, useRef, useState } from "react";

import { convertMoney, money } from "@nexload-sdk/persian/money";

import { formatMoney, type MoneyCurrencyDefinition, type MoneyDisplayOptions, parseMoneyToMinorUnits, resolveCurrency } from "../money";

type Props = { currency: MoneyCurrencyDefinition; display: MoneyDisplayOptions; displayCurrency?: "IRR" | "IRT"; allowNegative: boolean };
export const MoneyFieldComponent = ({ field, path, currency, display, displayCurrency, readOnly }: NumberFieldClientProps & Props) => {
  const { value, setValue, showError, errorMessage, disabled } = useField<number | string | null>({ path });
  const [input, setInput] = useState("");
  const lastSetValue = useRef<{ value: number | string | null } | null>(null);
  const shownCurrency = displayCurrency ?? currency;
  const inputCurrency = displayCurrency === "IRT" && currency.code === "IRR"
    ? { ...resolveCurrency(shownCurrency), fractionDigits: 1 }
    : resolveCurrency(shownCurrency);
  useEffect(() => {
    if (lastSetValue.current && Object.is(lastSetValue.current.value, value)) return;
    lastSetValue.current = null;
    const shown = typeof value === "number" && displayCurrency
      ? convertMoney(money(value, currency.code as "IRR" | "IRT"), displayCurrency, { rounding: "round" }).amount : value;
    setInput(typeof shown === "number" ? (formatMoney(shown, shownCurrency, { ...display, showCurrency: false }) ?? "") : typeof shown === "string" ? shown : "");
  }, [currency, display, displayCurrency, shownCurrency, value]);
  const change = (next: string) => {
    setInput(next);
    let nextValue: number | string | null = null;

    if (next.trim()) {
      try {
        const parsed = parseMoneyToMinorUnits(next, inputCurrency);
        nextValue = displayCurrency === "IRT" && currency.code === "IRR"
          ? parsed
          : displayCurrency ? convertMoney(money(parsed, displayCurrency), currency.code as "IRR" | "IRT").amount : parsed;
      } catch { nextValue = next; }
    }
    lastSetValue.current = { value: nextValue };
    setValue(nextValue);
  };
  const blur = () => {
    try {
      const parsed = parseMoneyToMinorUnits(input, inputCurrency);
      setInput(formatMoney(parsed, inputCurrency, { ...display, showCurrency: false }) ?? "");
    } catch { /* Preserve invalid input for validation. */ }
  };

  return <div className="field-type money-field">
    <FieldLabel htmlFor={`field-${path}`} path={path} label={field.label} required={field.required} localized={field.localized} />
    <FieldError path={path} message={errorMessage} showError={showError} />
    <input id={`field-${path}`} inputMode="decimal" onChange={(event) => change(event.target.value)} onBlur={blur} readOnly={readOnly || disabled} value={input} />
    <span>{resolveCurrency(shownCurrency).label}</span>
    <FieldDescription path={path} description={field.admin?.description} />
  </div>;
};
