"use client";

import type { Control, FieldValues, Path } from "react-hook-form";
import { UserSelector } from "@/components/inputs/user-selector";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

interface UserSelectFieldProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  label: string;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  showClearButton?: boolean;
  modalPopover?: boolean;
}

export function UserSelectField<T extends FieldValues>({
  control,
  name,
  label,
  placeholder = "请选择谱师",
  disabled = false,
  className,
  showClearButton = true,
  modalPopover = false,
}: UserSelectFieldProps<T>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className="flex flex-col">
          <FormLabel htmlFor={name}>{label}</FormLabel>
          <FormControl>
            <UserSelector
              value={field.value}
              onValueChange={field.onChange}
              placeholder={placeholder}
              disabled={disabled}
              className={className}
              showClearButton={showClearButton}
              modalPopover={modalPopover}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
