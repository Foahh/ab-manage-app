"use client";

import type { Control, FieldValues, Path } from "react-hook-form";
import { SongSelector } from "@/components/inputs/song-selector";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

interface SongSelectFieldProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  label: string;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  showClearButton?: boolean;
  modalPopover?: boolean;
  hideSelected?: boolean;
}

export function SongSelectField<T extends FieldValues>({
  control,
  name,
  label,
  placeholder = "请选择歌曲",
  disabled = false,
  className,
  showClearButton = true,
  modalPopover = false,
  hideSelected = false,
}: SongSelectFieldProps<T>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className="flex flex-col">
          <FormLabel htmlFor={name}>{label}</FormLabel>
          <FormControl>
            <SongSelector
              value={field.value}
              onValueChange={field.onChange}
              placeholder={placeholder}
              disabled={disabled}
              className={className}
              showClearButton={showClearButton}
              modalPopover={modalPopover}
              hideSelected={hideSelected}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
