"use client";

import React from "react";

import { formatDate } from "./format-date";

interface Props { cellData?: string | Date | null }

export const DateCell: React.FC<Props> = ({ cellData, }) => {
  if (!cellData) return <>—</>;

  return (
    <>
      {formatDate(cellData)}
    </>
  );
};
