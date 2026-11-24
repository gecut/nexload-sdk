"use client";

import type { DefaultCellComponentProps } from "payload";

import { DefaultCell } from "@payloadcms/ui";

import { formatCardNumber, formatSheba } from "@nexload-sdk/persian/bank";
import { formatIranMobile } from "@nexload-sdk/persian/mobile";

import type { ValidatedTextKind } from "../internal/validated-text";

export const FormattedCell = ({ kind, ...props }: DefaultCellComponentProps & { kind: ValidatedTextKind }) => {
  const { cellData, } = props;
  const value = cellData === null || cellData === undefined || cellData === "" ? "" : String(cellData);
  const formatted = !value ? "—" : kind === "mobile" ? formatIranMobile(value) : kind === "card" ? formatCardNumber(value) : kind === "sheba" ? formatSheba(value) : value;

  return <DefaultCell {...props} cellData={formatted ?? value} />;
};
