"use client";

import type { DefaultCellComponentProps } from "payload";

import { formatJalaliDate, type JalaliDateDisplayOptions } from "../date/format-date";

export const JalaliDateCell = ({
  cellData,
  display,
}: DefaultCellComponentProps & { display?: JalaliDateDisplayOptions }) => (
  <>
    {formatJalaliDate(
      cellData as string | null, display
    ) ?? "—"}
  </>
);
