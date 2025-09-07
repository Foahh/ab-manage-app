"use client";

import type {
  Control,
  ControllerFieldState,
  ControllerRenderProps,
  FieldValues,
  Path,
  UseFormStateReturn,
} from "react-hook-form";
import type { ZodObject } from "zod";
import { JsonEditor } from "@/components/inputs/json-editor";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

interface JsonFieldProps<T extends FieldValues> {
  width?: string;
  height?: string;
  schema: ZodObject;
  control: Control<T>;
  name: Path<T>;
  label: string;
  placeholder?: string;
}

interface JsonFieldRenderProps<T extends FieldValues> {
  width?: string;
  height?: string;
  field: ControllerRenderProps<T, Path<T>>;
  fieldState: ControllerFieldState;
  formState: UseFormStateReturn<T>;
  schema: ZodObject;
  label: string;
  placeholder?: string;
}

function JsonFieldRender<T extends FieldValues>({
  width,
  height,
  schema,
  label,
  placeholder,
  field: { value, onChange, onBlur },
  fieldState: { error },
}: JsonFieldRenderProps<T>) {
  return (
    <FormItem>
      <FormLabel>{label}</FormLabel>
      <FormControl>
        <JsonEditor
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          schema={schema}
          placeholder={placeholder}
          width={width}
          height={height}
          error={error?.message}
        />
      </FormControl>
      <FormMessage />
    </FormItem>
  );
}

export function JsonField<T extends FieldValues>({
  width,
  height,
  schema,
  control,
  name,
  label,
  placeholder,
}: JsonFieldProps<T>) {
  return (
    <FormField
      control={control}
      name={name}
      render={(props) => (
        <JsonFieldRender
          {...props}
          schema={schema}
          label={label}
          placeholder={placeholder}
          width={width}
          height={height}
        />
      )}
    />
  );
}
