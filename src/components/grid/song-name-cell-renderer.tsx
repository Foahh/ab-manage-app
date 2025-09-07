"use client";

import type { CustomCellRendererProps } from "ag-grid-react";
import { useAllUsersQuery } from "@/hooks/query";

export function UserNameCellRenderer(
  params: CustomCellRendererProps<unknown, number>,
) {
  const { data: users } = useAllUsersQuery();
  const userId = params.value;
  if (!userId || !users) {
    return <span>-</span>;
  }
  const user = users.find((u) => u.id === userId);
  return <span>{user ? user.name : "未知谱师"}</span>;
}
