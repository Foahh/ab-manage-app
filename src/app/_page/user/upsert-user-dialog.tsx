"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type { z } from "zod";
import { UserUpdateSchema } from "@/actions/schemas/user-action-schema";
import { addUser, editUser, type User } from "@/actions/user-action";
import { InputField } from "@/components/form/input-field";
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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

type UpsertUserDialogProps = {
  open: boolean;
  setOpen: (open: boolean) => void;
  initial: User | null;
  onSuccess?: () => void;
};

export function UpsertUserDialog({
  open,
  setOpen,
  initial,
  onSuccess,
}: UpsertUserDialogProps) {
  const defaultValues = useMemo(
    () => ({
      name: initial?.name ?? "",
      contact: initial?.contact ?? "",
      bilibili: initial?.bilibili ?? "",
      isJammer: initial?.isJammer ?? false,
    }),
    [initial?.name, initial?.contact, initial?.bilibili, initial?.isJammer],
  );

  const form = useForm<z.infer<typeof UserUpdateSchema>>({
    resolver: zodResolver(UserUpdateSchema),
    defaultValues,
    mode: "onTouched",
  });

  useEffect(() => {
    if (open) {
      form.reset(defaultValues);
    }
  }, [open, defaultValues, form]);

  const mutation = useMutation({
    mutationFn: async (data: z.infer<typeof UserUpdateSchema>) =>
      initial ? editUser(initial.id, data) : addUser(data),
    onSuccess: () => {
      toast.success(initial ? "谱师信息已更新。" : "已创建谱师。");
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
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{initial ? "编辑谱师" : "新增谱师"}</DialogTitle>
          <DialogDescription>完成后点击保存。</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={onSubmit} className="space-y-4">
            <fieldset disabled={mutation.isPending} className="space-y-4">
              <InputField
                control={form.control}
                name="name"
                label="昵称"
                placeholder="请输入昵称"
                required
                autoFocus
              />
              <InputField
                control={form.control}
                name="contact"
                label="联系方式"
                placeholder="请输入联系方式"
                type="number"
                inputProps={{
                  inputMode: "numeric",
                  pattern: "[0-9]*",
                  min: 0,
                }}
              />
              <InputField
                control={form.control}
                name="bilibili"
                label="Bilibili"
                placeholder="请输入 Bilibili 个人主页"
              />
              {mutation.isError && (
                <p className="text-destructive text-sm" role="alert">
                  操作失败。
                </p>
              )}
              <FormField
                control={form.control}
                name="isJammer"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center gap-2">
                    <FormControl>
                      <Checkbox
                        checked={field.value ?? false}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel>干扰谱师</FormLabel>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
