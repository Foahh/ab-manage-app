"use client";

import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { exportPack } from "@/actions/export-action";
import { txQuestionnaire } from "@/actions/tx-questionnaire-action";
import { JsonEditor } from "@/components/inputs/json-editor";
import { QuestionnaireDialog } from "@/components/page/pack/questionnaire-dialog";
import { Button } from "@/components/ui/button";
import {
  type PackMetadata,
  PackMetadataSchema,
} from "@/lib/arcaea/pack-schema";

export function PackManage() {
  const [openExamResultDialog, setOpenExamResultDialog] = useState(false);
  const [examResult, setExamResult] = useState<string | null>(null);

  const [metadata, setMetadata] = useState<PackMetadata>({
    id: "ab2025s1",
    section: "free",
    plus_character: -1,
    img: "select_ab2025s1.png",
    custom_banner: false,
    name_localized: {
      en: "Anonymous Battle",
    },
  });

  const { mutate: exportMutate, isPending: isExportPending } = useMutation({
    mutationFn: exportPack,
    onError: (error) => {
      toast.error(`导出失败。`);
      console.error(error);
    },
  });

  const { mutate: examMutate, isPending: isExamPending } = useMutation({
    mutationFn: txQuestionnaire,
    onError: (error) => {
      toast.error(`问卷生成失败。`);
      console.error(error);
    },
    onSuccess: (data) => {
      setExamResult(data);
      setOpenExamResultDialog(true);
    },
  });

  return (
    <section className="mx-2 space-y-2">
      <header className="flex items-center space-x-2 border-2 p-2 rounded-xl">
        <Button
          disabled={isExportPending}
          onClick={() => {
            exportMutate({ packMeta: metadata, mysteryBox: false });
          }}
        >
          导出
        </Button>
        <Button
          disabled={isExportPending}
          onClick={() => {
            exportMutate({ packMeta: metadata, mysteryBox: true });
          }}
        >
          导出盲盒
        </Button>
        <Button disabled={isExamPending} onClick={() => examMutate()}>
          生成问卷
        </Button>
      </header>
      <JsonEditor
        value={metadata}
        onChange={setMetadata}
        height="200px"
        schema={PackMetadataSchema}
        placeholder="请编辑曲包信息"
      />

      {examResult && (
        <QuestionnaireDialog
          open={openExamResultDialog}
          setOpen={setOpenExamResultDialog}
          content={examResult}
        />
      )}
    </section>
  );
}
