"use client";

import type { DefaultCellComponentProps } from "payload";

import { DefaultCell } from "@payloadcms/ui";

import { convertMoney, money } from "@nexload-sdk/persian/money";

import { formatMoney, type MoneyCurrencyDefinition, type MoneyDisplayOptions } from "../money";

type Props = { currency: MoneyCurrencyDefinition; display: MoneyDisplayOptions; displayCurrency?: "IRR" | "IRT" };
export const MoneyCell = ({ currency, display, displayCurrency, ...props }: DefaultCellComponentProps & Props) => {
  const value = props.cellData;
  const valid = typeof value === "number" && Number.isSafeInteger(value)
    && !(displayCurrency === "IRR" && Math.abs(value) > Math.floor(Number.MAX_SAFE_INTEGER / 10));
  const converted = valid && displayCurrency
    ? convertMoney(money(value, currency.code as "IRR" | "IRT"), displayCurrency, { rounding: "round" }).amount
    : value;
  const formatted = valid && typeof converted === "number" && Number.isSafeInteger(converted) ? formatMoney(converted, displayCurrency ?? currency, display) : "—";

  return <DefaultCell {...props} cellData={formatted} />;
};
