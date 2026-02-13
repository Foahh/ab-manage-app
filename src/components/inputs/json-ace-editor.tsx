import dynamic from "next/dynamic";
import type { IMarker } from "react-ace";

const AceEditor = dynamic(
  async () => {
    const ace = await import("react-ace");
    await import("ace-builds/src-noconflict/mode-json");
    await import("ace-builds/src-noconflict/theme-github_dark");
    await import("ace-builds/src-noconflict/ext-language_tools");
    return ace;
  },
  { ssr: false },
);

type JsonAceEditorProps = {
  value: string;
  onChange?: (value: string) => void;
  onBlur?: () => void;
  markers?: IMarker[];
  height?: string;
  width?: string;
  placeholder?: string;
  className?: string;
  id?: string;
};

export function JsonAceEditor({
  placeholder,
  value,
  onChange,
  onBlur,
  markers = [],
  height = "auto",
  width = "auto",
  className,
  id,
}: JsonAceEditorProps) {
  return (
    <div>
      <AceEditor
        placeholder={placeholder}
        mode="json"
        theme="github_dark"
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        name={id || "json_editor"}
        editorProps={{ $blockScrolling: true }}
        fontSize={16}
        width={width}
        height={height}
        setOptions={{ useWorker: false }}
        markers={markers}
        className={className}
      />
      <style>
        {`
        .error-highlight {
          background: rgba(239, 68, 68, 0.2) !important;
          border-left: 3px solid #ef4444 !important;
          position: absolute;
        }
        .ace_editor .ace_gutter-cell.ace_error {
          background-color: rgba(239, 68, 68, 0.2);
        }
      `}
      </style>
    </div>
  );
}
