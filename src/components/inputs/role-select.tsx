"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type RoleValue = "real" | "fake_assigned" | "fake_random";

interface RoleSelectProps {
  value?: RoleValue;
  onValueChange?: (value: RoleValue) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function RoleSelect({
  value,
  onValueChange,
  placeholder = "选择角色",
  disabled = false,
  className,
}: RoleSelectProps) {
  return (
    <Select value={value} onValueChange={onValueChange} disabled={disabled}>
      <SelectTrigger className={className}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="real">真</SelectItem>
        <SelectItem value="fake_assigned">假</SelectItem>
        <SelectItem value="fake_random">假（随机）</SelectItem>
      </SelectContent>
    </Select>
  );
}
