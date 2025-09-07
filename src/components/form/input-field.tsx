"use client";

import type React from "react";
import type { Control, FieldValues, Path } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

type InputFormFieldProps<T extends FieldValues> = {
  control: Control<T>;
  name: Path<T>;
  label: string;
  placeholder?: string;
  type?: string;
  required?: boolean;
  autoFocus?: boolean;
  inputProps?: React.ComponentProps<typeof Input>;
} & Omit<
  React.ComponentProps<typeof Input>,
  "name" | "type" | "placeholder" | "autoFocus" | "required"
>;

export function InputField<T extends FieldValues>({
  control,
  name,
  label,
  placeholder = "",
  type = "text",
  required = false,
  autoFocus = false,
  inputProps,
  ...rest
}: InputFormFieldProps<T>) {
  const inputId = `input-${name}`;

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel htmlFor={inputId}>
            {label}
            {required && " *"}
          </FormLabel>
          <FormControl>
            <Input
              id={inputId}
              type={type}
              placeholder={placeholder}
              required={required}
              autoFocus={autoFocus}
              {...inputProps}
              {...rest}
              {...field}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
