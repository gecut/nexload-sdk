"use client";

import type { DateFieldClient, DefaultCellComponentProps } from "payload";

import { DefaultCell } from "@payloadcms/ui";

import { formatJalaliDate, type JalaliDateDisplayOptions, type JalaliDateValue } from "../date/format-date";

export const JalaliDateCell = ({
  display,
  ...props
}: DefaultCellComponentProps<DateFieldClient, JalaliDateValue> & { display?: JalaliDateDisplayOptions }) => (
  <DefaultCell {...props} cellData={formatJalaliDate(props.cellData, display) ?? "—"} />
);
