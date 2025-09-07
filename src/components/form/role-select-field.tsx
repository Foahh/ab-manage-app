"use client";

import type { Control, FieldValues, Path } from "react-hook-form";
import { RoleSelect } from "@/components/inputs/role-select";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

interface RoleSelectFieldProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  label: string;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  modalPopover?: boolean;
}

export function RoleSelectField<T extends FieldValues>({
  control,
  name,
  label,
  placeholder = "选择角色",
  disabled = false,
  className,
}: RoleSelectFieldProps<T>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={className}>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <RoleSelect
              value={field.value}
              onValueChange={field.onChange}
              placeholder={placeholder}
              disabled={disabled}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

// Re-export the type for convenience
export type { RoleValue } from "@/components/inputs/role-select";
