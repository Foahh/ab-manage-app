"use client";

import { useMutation } from "@tanstack/react-query";
import type { ColDef } from "ag-grid-community";
import type { AgGridReact, CustomCellRendererProps } from "ag-grid-react";
import { Pen, Trash } from "lucide-react";
import { useCallback, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { randomAssignSongers } from "@/actions/random-songer-action";
import type { Songer } from "@/actions/songer-action";
import Grid from "@/components/grid/ag-grid";
import { DeleteSongerDialog } from "@/components/page/songer/delete-songer-dialog";
import { UpsertSongerDialog } from "@/components/page/songer/upsert-songer-dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  useAllSongersQuery,
  useAllSongsQuery,
  useAllUsersQuery,
} from "@/hooks/query";

export function SongerManage() {
  const { data: users } = useAllUsersQuery();
  const { data: songs } = useAllSongsQuery();
  const {
    isPending: isSongerPending,
    error: songerError,
    data: songers,
    refetch: refetchSong,
  } = useAllSongersQuery();

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedSonger, setSelectedSonger] = useState<Songer | null>(null);

  const openAddDialog = useCallback(() => {
    setSelectedSonger(null);
    setEditDialogOpen(true);
  }, []);

  const openEditDialog = useCallback((songer?: Songer) => {
    setSelectedSonger(songer ?? null);
    setEditDialogOpen(true);
  }, []);

  const openDeleteDialog = useCallback((songer?: Songer) => {
    setSelectedSonger(songer ?? null);
    setDeleteDialogOpen(true);
  }, []);

  const actionCellRenderer = useCallback(
    (params: CustomCellRendererProps<Songer>) => (
      <div className="flex gap-1.5 w-full h-full justify-center items-center">
        <Button
          className="size-8"
          disabled={!params.data}
          onClick={() => openEditDialog(params.data)}
        >
          <Pen />
        </Button>
        <Button
          className="size-8"
          variant="destructive"
          disabled={!params.data}
          onClick={() => openDeleteDialog(params.data)}
        >
          <Trash />
        </Button>
      </div>
    ),
    [openEditDialog, openDeleteDialog],
  );

  const columnDefs: ColDef<Songer>[] = useMemo(
    () => [
      {
        headerName: "歌曲",
        field: "songId",
        flex: 1,
        valueFormatter: (params) => {
          const song = songs?.find((u) => u.id === params.value);
          return song ? song.metadata.id : "未知歌曲";
        },
        spanRows: true,
      },
      {
        headerName: "谱师",
        field: "userId",
        valueFormatter: (params) => {
          const user = users?.find((u) => u.id === params.value);
          return user ? user.name : "未知谱师";
        },
        flex: 1,
      },
      {
        headerName: "角色",
        field: "role",
        flex: 1,
      },
      {
        headerName: "更新于",
        field: "updated_at",
        width: 160,
        valueFormatter: (params) => params.value.toLocaleString(),
      },
      {
        headerName: "操作",
        width: 140,
        cellRenderer: actionCellRenderer,
        sortable: false,
        filter: false,
        editable: false,
      },
    ],
    [actionCellRenderer, songs, users],
  );

  const gridRef = useRef<AgGridReact<Songer>>(null);

  const relatedSongers = useMemo(() => {
    return songers?.filter((s) => s.songId === selectedSonger?.songId) || [];
  }, [selectedSonger?.songId, songers]);

  const randomMutate = useMutation({
    mutationFn: randomAssignSongers,
    onSuccess: async () => {
      toast.success("随机分配成功");
      await refetchSong();
    },
    onError: (error) => {
      toast.error("随机分配失败");
      console.error(error);
    },
  });

  const handleRandomAssign = useCallback(() => {
    randomMutate.mutate();
  }, [randomMutate]);

  return (
    <section className="mx-2 space-y-2">
      <header className="flex items-center space-x-2 border-2 p-2 rounded-xl">
        <Button onClick={openAddDialog} variant="default">
          新增选项
        </Button>
        <Button onClick={handleRandomAssign} variant="default">
          随机分配
        </Button>
      </header>

      {songerError && (
        <Alert variant="destructive">
          <AlertDescription>加载失败：{songerError?.message}</AlertDescription>
        </Alert>
      )}

      {!songerError && (
        <Grid<Songer>
          ref={gridRef}
          rowData={songers}
          columnDefs={columnDefs}
          domLayout="autoHeight"
          suppressClickEdit={true}
          loading={isSongerPending}
          enableCellSpan
        />
      )}

      <UpsertSongerDialog
        open={editDialogOpen}
        setOpen={setEditDialogOpen}
        initialSongId={selectedSonger?.songId}
        initialSongers={relatedSongers}
        onSuccess={refetchSong}
      />

      {selectedSonger && (
        <DeleteSongerDialog
          open={deleteDialogOpen}
          setOpen={setDeleteDialogOpen}
          songer={selectedSonger}
          onSuccess={refetchSong}
        />
      )}
    </section>
  );
}
