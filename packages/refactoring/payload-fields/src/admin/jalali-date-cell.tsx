"use client";

import { formatJalaliDate, type JalaliDateDisplayOptions } from "../date/format-date";

import type { DefaultCellComponentProps } from "payload";

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
