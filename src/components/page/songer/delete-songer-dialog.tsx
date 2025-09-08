import { useMutation } from "@tanstack/react-query";
import { useEffect, useMemo } from "react";
import { toast } from "sonner";
import { deleteSonger, type Songer } from "@/actions/songer-action";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAllSongsQuery, useAllUsersQuery } from "@/hooks/query";

type DeleteSongerDialogProps = {
  open: boolean;
  setOpen: (open: boolean) => void;
  songer: Songer;
  onSuccess?: () => void;
};

export function DeleteSongerDialog({
  open,
  setOpen,
  songer,
  onSuccess,
}: DeleteSongerDialogProps) {
  const { data: users } = useAllUsersQuery();
  const { data: songs } = useAllSongsQuery();

  const { songName, userName } = useMemo(() => {
    const song = songs?.find((s) => s.id === songer.songId);
    const user = users?.find((u) => u.id === songer.userId);
    return {
      songName: song ? song.metadata.id : "未知歌曲",
      userName: user ? user.name : "未知谱师",
    };
  }, [songer.songId, songer.userId, songs, users]);

  const mutation = useMutation({
    mutationFn: () => deleteSonger(songer.songId, songer.userId),
    onSuccess: () => {
      toast.success("选项已删除。");
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
          <DialogTitle>删除选项</DialogTitle>
          <DialogDescription>
            确定要删除选项{" "}
            <span className="font-semibold">
              {songName} - {userName}
            </span>{" "}
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
