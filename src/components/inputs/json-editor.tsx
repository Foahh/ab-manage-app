"use client";

import * as React from "react";
import type { IMarker } from "react-ace";
import type { ZodObject } from "zod";
import { JsonAceEditor } from "@/components/inputs/json-ace-editor";

export interface JsonEditorProps<T> {
  value: T | undefined;
  onChange: (value: T) => void;
  onBlur?: () => void;
  schema: ZodObject;
  placeholder?: string;
  width?: string;
  height?: string;
  className?: string;
  error?: string | null;
}

export function JsonEditor<T>({
  value,
  onChange,
  onBlur,
  schema,
  placeholder,
  width,
  height,
  className,
  error: externalError,
}: JsonEditorProps<T>) {
  const [editorMarkers, setEditorMarkers] = React.useState<IMarker[]>([]);
  const [editorErrors, setEditorErrors] = React.useState<string | null>(null);
  const editorId = React.useId();

  const [rawValue, setRawValue] = React.useState(
    value && typeof value === "object" ? JSON.stringify(value, null, 2) : "",
  );

  // biome-ignore lint/correctness/useExhaustiveDependencies: Value reference only
  React.useEffect(() => {
    if (
      value &&
      typeof value === "object" &&
      JSON.stringify(value, null, 2) !== rawValue
    ) {
      setRawValue(JSON.stringify(value, null, 2));
    }
  }, [value]);

  function handleEditorChange(newValue: string) {
    setRawValue(newValue);
    try {
      const parsed = JSON.parse(newValue);
      const result = schema.safeParse(parsed);
      if (!result.success) {
        setEditorErrors(result.error.issues.map((i) => i.message).join(", "));
        setEditorMarkers([
          {
            startRow: 0,
            startCol: 0,
            endRow: 0,
            endCol: 1,
            className: "error-highlight",
            type: "fullLine",
          },
        ]);
      } else {
        setEditorErrors(null);
        setEditorMarkers([]);
        onChange(parsed);
      }
    } catch {
      setEditorErrors("JSON 格式无效");
      setEditorMarkers([
        {
          startRow: 0,
          startCol: 0,
          endRow: 0,
          endCol: 1,
          className: "error-highlight",
          type: "fullLine",
        },
      ]);
    }
  }

  const mergedError = editorErrors || externalError;

  return (
    <div className={`grid gap-2 ${className || ""}`}>
      <JsonAceEditor
        id={editorId}
        value={rawValue}
        onChange={handleEditorChange}
        onBlur={onBlur}
        markers={editorMarkers}
        height={height}
        width={width}
        placeholder={placeholder}
        className="rounded-md"
      />
      {mergedError && (
        <p className="text-destructive text-sm" data-slot="json-editor-error">
          {mergedError}
        </p>
      )}
    </div>
  );
}
