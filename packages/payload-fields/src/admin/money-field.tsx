"use client";

import { FieldLabel, useField } from "@payloadcms/ui";
import { useEffect, useState } from "react";

import { formatMoney, parseMoneyToMinorUnits, type MoneyCurrencyDefinition, type MoneyDisplayOptions } from "../money";

import type { NumberFieldClientProps } from "payload";

type Props = { currency: MoneyCurrencyDefinition, display: MoneyDisplayOptions, allowNegative: boolean };

export const MoneyFieldComponent = ({
  field, path, currency, display, readOnly,
}: NumberFieldClientProps & Props) => {
  const { value, setValue, } = useField<number | string | null>({ path, });
  const [
    input,
    setInput
  ] = useState("");
  useEffect(
    () => setInput(typeof value === "number"
      ? (formatMoney(
        value, currency, { ...display, showCurrency: false, }
      ) ?? "")
      : ""), [
      currency,
      display,
      value
    ]
  );
  const change = (next: string) => {
    setInput(next);
    if (!next.trim()) return setValue(null);
    try {
      setValue(parseMoneyToMinorUnits(
        next, currency
      ));
    } catch { setValue(next); }
  };
  return (
    <div className="field-type money-field">
      <FieldLabel htmlFor={`field-${path}`} label={field.label} required={field.required} />
      <input
        inputMode="decimal" onChange={(event) => change(event.target.value)} readOnly={readOnly}
        value={input}
      />
      <span>
        {currency.label}
      </span>
    </div>
  );
};
