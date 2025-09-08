import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type { z } from "zod";
import { SongUpdateSchema } from "@/actions/schemas/song-action-schema";
import { addSong, editSong, type Song } from "@/actions/song-action";
import { JsonField } from "@/components/form/json-field";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { SongMetadataSchema } from "@/lib/arcaea/song-schema";

type UpsertSongDialogProps = {
  open: boolean;
  setOpen: (open: boolean) => void;
  initial: Partial<Song> | null;
  onSuccess?: () => void;
};

export function UpsertSongDialog({
  open,
  setOpen,
  initial,
  onSuccess,
}: UpsertSongDialogProps) {
  const defaultValues = useMemo(
    () => ({
      metadata: initial?.metadata ?? {},
      isBonus: initial?.isBonus ?? false,
      mysteryOrder: initial?.mysteryOrder ?? 0,
    }),
    [initial?.metadata, initial?.isBonus, initial?.mysteryOrder],
  );

  const form = useForm<z.infer<typeof SongUpdateSchema>>({
    resolver: zodResolver(SongUpdateSchema),
    defaultValues,
    mode: "onTouched",
  });

  useEffect(() => {
    if (open) {
      form.reset(defaultValues);
    }
  }, [open, defaultValues, form]);

  const mutation = useMutation({
    mutationFn: async (data: z.infer<typeof SongUpdateSchema>) =>
      initial?.id ? editSong(initial.id, data) : addSong(data),
    onSuccess: () => {
      toast.success(initial ? "歌曲信息已更新。" : "已创建歌曲。");
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

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-2xl md:max-w-3xl">
        <DialogHeader>
          <DialogTitle>{initial ? "编辑歌曲" : "新增歌曲"}</DialogTitle>
          <DialogDescription>完成后点击保存。</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={onSubmit} className="space-y-4">
            <fieldset
              disabled={mutation.isPending}
              className="w-full space-y-4"
            >
              <JsonField
                height="330px"
                control={form.control}
                schema={SongMetadataSchema}
                name="metadata"
                label="歌曲信息"
              />
              <FormField
                control={form.control}
                name="mysteryOrder"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>盲盒顺位</FormLabel>
                    <FormDescription>数值越小越靠前</FormDescription>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="请输入神秘谱面顺序"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="isBonus"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center gap-2">
                    <FormControl>
                      <Checkbox
                        checked={field.value ?? false}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel>[Bonus]</FormLabel>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
                disabled={mutation.isPending}
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
