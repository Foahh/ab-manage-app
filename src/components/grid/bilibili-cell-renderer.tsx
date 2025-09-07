import type { CustomCellRendererProps } from "ag-grid-react";
import React, { Fragment } from "react";

export function BilibiliCellRenderer(params: CustomCellRendererProps) {
  const value = params.value ?? null;
  if (!value) {
    return <Fragment />;
  }
  return (
    <a
      href={`https://space.bilibili.com/${value}`}
      target="_blank"
      rel="noreferrer"
      className="text-blue-600 hover:underline"
    >
      {value}
    </a>
  );
}
