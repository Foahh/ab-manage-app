"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type CustomRoleValue = "real" | "fake";

interface CustomRoleSelectProps {
  value?: CustomRoleValue;
  onValueChange?: (value: CustomRoleValue) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function CustomRoleSelect({
  value,
  onValueChange,
  placeholder = "选择角色",
  disabled = false,
  className,
}: CustomRoleSelectProps) {
  return (
    <Select
      value={value}
      onValueChange={onValueChange as (v: string) => void}
      disabled={disabled}
    >
      <SelectTrigger className={className}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="real">真</SelectItem>
        <SelectItem value="fake">假</SelectItem>
      </SelectContent>
    </Select>
  );
}
