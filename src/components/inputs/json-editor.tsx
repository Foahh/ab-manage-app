"use client";

import * as React from "react";
import type { IMarker } from "react-ace";
import type { ZodObject } from "zod";
import jsonMap from "json-source-map";
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

// Helper function to convert Zod path to JSON pointer
// Zod path: ["songs", 1, "bpm_base"] -> JSON pointer: "/songs/1/bpm_base"
function zodPathToJsonPointer(path: (string | number)[]): string {
  if (path.length === 0) {
    return "";
  }
  return (
    "/" +
    path
      .map((segment) =>
        String(segment).replace(/~/g, "~0").replace(/\//g, "~1"),
      )
      .join("/")
  );
}

// Helper function to find line number from character position
function getLineNumberFromPosition(text: string, position: number): number {
  return text.substring(0, position).split("\n").length - 1;
}

// Helper function to find the line number of a JSON path using json-source-map
function findJsonPathLine(
  text: string,
  path: (string | number)[],
): number | null {
  try {
    // Parse JSON with source map
    const result = jsonMap.parse(text);
    const jsonPointer = zodPathToJsonPointer(path);

    // Look up the path in the source map
    const pointer = result.pointers[jsonPointer];
    if (pointer?.key) {
      // If it's a key, return the key's line
      return pointer.key.line;
    } else if (pointer?.value) {
      // Otherwise return the value's line
      return pointer.value.line;
    }

    // Fallback: try to find by key name if path not found
    if (path.length > 0) {
      const targetKey = String(path[path.length - 1]);
      const escapedKey = targetKey.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const keyPattern = new RegExp(`"${escapedKey}"\\s*:`, "g");
      const match = keyPattern.exec(text);
      if (match && match.index !== undefined) {
        return getLineNumberFromPosition(text, match.index);
      }
    }

    return null;
  } catch {
    // If JSON parsing fails, fall back to simple position extraction
    return null;
  }
}

// Helper function to extract line number from JSON parse error
function extractJsonErrorPosition(error: unknown, text: string): number | null {
  if (error instanceof SyntaxError) {
    const message = error.message;
    // Try to extract position from error message (format: "Unexpected token X in JSON at position Y")
    const positionMatch = message.match(/position\s+(\d+)/i);
    if (positionMatch) {
      const position = parseInt(positionMatch[1], 10);
      return getLineNumberFromPosition(text, position);
    }
    // Try to extract line number directly
    const lineMatch = message.match(/line\s+(\d+)/i);
    if (lineMatch) {
      return parseInt(lineMatch[1], 10) - 1; // Convert to 0-based
    }
  }
  return null;
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
        // Build detailed error messages with paths
        const errorMessages = result.error.issues.map((issue) => {
          const path = issue.path.length > 0 ? issue.path.join(".") : "root";
          return `${path}: ${issue.message}`;
        });
        setEditorErrors(errorMessages.join("; "));

        // Create markers for each error, trying to find their positions
        const markers: IMarker[] = result.error.issues.map((issue) => {
          // Convert PropertyKey[] to (string | number)[]
          const path: (string | number)[] = issue.path
            .map((p) =>
              typeof p === "string" || typeof p === "number" ? p : String(p),
            )
            .filter(
              (p): p is string | number =>
                typeof p === "string" || typeof p === "number",
            );
          const line = findJsonPathLine(newValue, path) ?? 0;
          const lines = newValue.split("\n");
          const lineLength = lines[line]?.length ?? 0;

          return {
            startRow: line,
            startCol: 0,
            endRow: line,
            endCol: Math.max(1, lineLength),
            className: "error-highlight",
            type: "fullLine",
          };
        });

        setEditorMarkers(markers);
      } else {
        setEditorErrors(null);
        setEditorMarkers([]);
        onChange(parsed);
      }
    } catch (parseError) {
      const errorLine = extractJsonErrorPosition(parseError, newValue) ?? 0;
      const lines = newValue.split("\n");
      const lineLength = lines[errorLine]?.length ?? 0;

      let errorMessage = "JSON 格式无效";
      if (parseError instanceof SyntaxError) {
        errorMessage = `JSON 格式错误: ${parseError.message}`;
      }

      setEditorErrors(errorMessage);
      setEditorMarkers([
        {
          startRow: errorLine,
          startCol: 0,
          endRow: errorLine,
          endCol: Math.max(1, lineLength),
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
