import { useMutation } from "@tanstack/react-query";
import { useEffect } from "react";
import { toast } from "sonner";
import { deleteSong, type Song } from "@/actions/song-action";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type DeleteSongDialogProps = {
  open: boolean;
  setOpen: (open: boolean) => void;
  song: Song;
  onSuccess?: () => void;
};

export function DeleteSongDialog({
  open,
  setOpen,
  song,
  onSuccess,
}: DeleteSongDialogProps) {
  const songId = song.id;

  const mutation = useMutation({
    mutationFn: () => deleteSong(songId),
    onSuccess: () => {
      toast.success("歌曲已删除。");
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
          <DialogTitle>删除歌曲</DialogTitle>
          <DialogDescription>
            确定要删除歌曲{" "}
            <span className="font-semibold">{song.metadata.id}</span>{" "}
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
