"use client";

import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { SongBulkImportSchema } from "@/actions/schemas/song-action-schema";
import { bulkImportSongs } from "@/actions/song-action";
import { JsonEditor } from "@/components/inputs/json-editor";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { z } from "zod";

type BulkImportSongsDialogProps = {
  open: boolean;
  setOpen: (open: boolean) => void;
  onSuccess?: () => void;
};

const defaultSongs: z.infer<typeof SongBulkImportSchema> = {
  songs: [],
};

export function BulkImportSongsDialog({
  open,
  setOpen,
  onSuccess,
}: BulkImportSongsDialogProps) {
  const [songsData, setSongsData] =
    useState<z.infer<typeof SongBulkImportSchema>>(defaultSongs);

  const mutation = useMutation({
    mutationFn: async (data: z.infer<typeof SongBulkImportSchema>) =>
      bulkImportSongs(data),
    onSuccess: (result) => {
      const count = Array.isArray(result) ? result.length : 1;
      toast.success(`成功导入 ${count} 首歌曲。`);
      setOpen(false);
      setSongsData(defaultSongs);
      onSuccess?.();
    },
    onError: (error) => {
      toast.error("批量导入失败。");
      console.error(error);
    },
  });

  const handleSubmit = () => {
    try {
      const validated = SongBulkImportSchema.parse(songsData);
      mutation.mutate(validated);
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error("数据格式错误，请检查 JSON 格式。");
      } else {
        toast.error("导入失败。");
      }
      console.error(error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-[90vw] max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>批量导入歌曲</DialogTitle>
          <DialogDescription>完成后点击保存。</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <JsonEditor
            value={songsData}
            onChange={setSongsData}
            schema={SongBulkImportSchema}
            height="400px"
            placeholder='{"songs": [...]}'
          />
          {mutation.isError && (
            <p className="text-destructive text-sm" role="alert">
              导入失败，请检查数据格式。
            </p>
          )}
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              setOpen(false);
              setSongsData(defaultSongs);
            }}
            disabled={mutation.isPending}
          >
            取消
          </Button>
          <Button
            type="button"
            variant="default"
            onClick={handleSubmit}
            disabled={mutation.isPending || !songsData.songs.length}
          >
            {mutation.isPending ? "导入中..." : "导入"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
