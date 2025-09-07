"use client";

import { useMutation } from "@tanstack/react-query";
import { useEffect } from "react";
import { toast } from "sonner";
import { deleteUser, type User } from "@/actions/user-action";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type DeleteUserDialogProps = {
  open: boolean;
  setOpen: (open: boolean) => void;
  user: User;
  onSuccess?: () => void;
};

export function DeleteUserDialog({
  open,
  setOpen,
  user,
  onSuccess,
}: DeleteUserDialogProps) {
  const userId = user.id;

  const mutation = useMutation({
    mutationFn: () => deleteUser(userId),
    onSuccess: () => {
      toast.success("谱师已删除。");
      setOpen(false);
      onSuccess?.();
    },
    onError: (error) => {
      toast.error("删除失败。");
      console.error(error);
    },
  });

  // biome-ignore lint/correctness/useExhaustiveDependencies: <mutation.reset>
  useEffect(() => {
    if (!open) {
      mutation.reset();
    }
  }, [open]);

  const handleConfirm = () => {
    if (!mutation.isPending) {
      mutation.mutate();
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>删除谱师</DialogTitle>
          <DialogDescription>
            确定要删除谱师 <span className="font-semibold">{user.name}</span>{" "}
            吗？此操作无法撤销。
          </DialogDescription>
        </DialogHeader>
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
            type="button"
            variant="destructive"
            onClick={handleConfirm}
            disabled={mutation.isPending}
          >
            {mutation.isPending ? "删除中..." : "删除"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
