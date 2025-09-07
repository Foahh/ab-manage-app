"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Plus, Trash2 } from "lucide-react";
import { useEffect, useMemo } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";
import type { z } from "zod";
import { MultipleSongersSchema } from "@/actions/schemas/songer-action-schema";
import { type Songer, updateMultipleSongers } from "@/actions/songer-action";
import { RoleSelectField } from "@/components/form/role-select-field";
import { SongSelectField } from "@/components/form/song-select-field";
import { UserSelectField } from "@/components/form/user-select-field";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";

type FormData = z.infer<typeof MultipleSongersSchema>;

type UpsertSongDialogProps = {
  open: boolean;
  setOpen: (open: boolean) => void;
  initialSongId?: number;
  initialSongers: Songer[];
  onSuccess?: () => void;
};

export function UpsertSongerDialog({
  open,
  setOpen,
  initialSongId,
  initialSongers,
  onSuccess,
}: UpsertSongDialogProps) {
  const defaultValues = useMemo((): FormData => {
    const songers =
      initialSongers.length > 0
        ? initialSongers.map((songer) => ({
            userId: songer.userId,
            role: songer.role,
          }))
        : [
            {
              userId: undefined,
              role: "fake_assigned" as const,
            },
          ];

    return {
      songId: initialSongId,
      songers,
    };
  }, [initialSongId, initialSongers]);

  const form = useForm<FormData>({
    resolver: zodResolver(MultipleSongersSchema),
    defaultValues,
    mode: "onTouched",
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "songers",
  });

  useEffect(() => {
    if (open) {
      form.reset(defaultValues);
    }
  }, [open, defaultValues, form]);

  const mutation = useMutation({
    mutationFn: async (data: FormData) => {
      if (!data.songId) {
        throw new Error("Song ID is required");
      }

      const validSongers = data.songers.filter(
        (
          songer,
        ): songer is {
          userId: number;
          role: typeof songer.role;
          isNew?: boolean;
        } => songer.userId !== undefined,
      );

      const submitData = {
        songId: data.songId,
        songers: validSongers,
      };

      return updateMultipleSongers(submitData);
    },
    onSuccess: () => {
      toast.success("选项信息已更新。");
      setOpen(false);
      onSuccess?.();
    },
    onError: (error) => {
      toast.error(`操作失败。`);
      console.error(error);
    },
  });

  const onSubmit = form.handleSubmit((data) => {
    mutation.mutate(data);
  });

  const addSonger = () => {
    append({ userId: undefined, role: "fake_assigned" });
  };

  const removeSonger = (index: number) => {
    if (fields.length > 1) {
      remove(index);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>编辑选项</DialogTitle>
          <DialogDescription>完成后点击保存。</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={onSubmit} className="space-y-4">
            <fieldset
              disabled={mutation.isPending}
              className="w-full space-y-2"
            >
              <SongSelectField
                modalPopover={true}
                disabled={initialSongId !== undefined}
                hideSelected={true}
                control={form.control}
                name="songId"
                label="歌曲"
              />
              <div className="space-y-2">
                {fields.map((field, index) => (
                  <div
                    key={field.id}
                    className="flex items-end gap-2 p-3 border rounded-lg"
                  >
                    <div className="flex-1">
                      <UserSelectField
                        modalPopover={true}
                        control={form.control}
                        name={`songers.${index}.userId`}
                        label="谱师"
                      />
                    </div>
                    <div className="flex-1">
                      <RoleSelectField
                        control={form.control}
                        name={`songers.${index}.role`}
                        label="角色"
                      />
                    </div>
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      onClick={() => removeSonger(index)}
                      disabled={fields.length === 1}
                      className="shrink-0"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>

              <Button
                type="button"
                variant="outline"
                onClick={addSonger}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                添加选项
              </Button>

              {mutation.isError && (
                <p className="text-destructive text-sm" role="alert">
                  操作失败。
                </p>
              )}
            </fieldset>
            <DialogFooter>
              <Button
                type="button"
                variant="secondary"
                onClick={() => setOpen(false)}
              >
                取消
              </Button>
              <Button
                type="submit"
                variant="default"
                disabled={mutation.isPending}
              >
                {mutation.isPending ? "保存中..." : "保存"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
