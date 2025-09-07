"use client";

import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { exportPack } from "@/actions/export-action";
import { JsonEditor } from "@/components/inputs/json-editor";
import { Button } from "@/components/ui/button";
import {
  type PackMetadata,
  PackMetadataSchema,
} from "@/lib/arcaea/pack-schema";

export function PackManage() {
  const [metadata, setMetadata] = useState<PackMetadata>({
    id: "ab2025s1",
    section: "free",
    name_localized: {
      en: "Anonymous Battle 2025 S1",
    },
  });

  const { mutate, isPending } = useMutation({
    mutationFn: exportPack,
    onError: (error) => {
      toast.error(`导出失败。`);
      console.error(error);
    },
  });

  return (
    <section className="mx-2 space-y-2">
      <header className="flex items-center space-x-2 border-2 p-2 rounded-xl">
        <Button
          disabled={isPending}
          onClick={() => {
            mutate({ packMeta: metadata, mysteryBox: false });
          }}
        >
          导出
        </Button>
        <Button
          disabled={isPending}
          onClick={() => {
            mutate({ packMeta: metadata, mysteryBox: true });
          }}
        >
          导出盲盒
        </Button>
      </header>

      <JsonEditor
        value={metadata}
        onChange={setMetadata}
        height="200px"
        schema={PackMetadataSchema}
        placeholder="请编辑曲包信息"
      />
    </section>
  );
}
