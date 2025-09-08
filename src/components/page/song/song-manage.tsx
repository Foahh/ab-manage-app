"use client";

import { useMutation } from "@tanstack/react-query";
import type { ColDef } from "ag-grid-community";
import type { AgGridReact, CustomCellRendererProps } from "ag-grid-react";
import { Pen, Trash } from "lucide-react";
import { useCallback, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { randomMysteryOrder } from "@/actions/random-order-action";
import type { Song } from "@/actions/song-action";
import { deleteSonger } from "@/actions/songer-action";
import Grid from "@/components/grid/ag-grid";
import {
  ChartDesignerCellRenderer,
  ChartDifficultyCellRenderer,
} from "@/components/grid/chart-cell-renderer";
import { DeleteSongDialog } from "@/components/page/song/delete-song-dialog";
import { UpsertSongDialog } from "@/components/page/song/upsert-song-dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useAllSongsQuery } from "@/hooks/query";
import type { SongMetadata } from "@/lib/arcaea/song-schema";

export function SongManage() {
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);

  const openAddDialog = useCallback(() => {
    setSelectedSong(null);
    setEditDialogOpen(true);
  }, []);

  const openEditDialog = useCallback((song?: Song) => {
    setSelectedSong(song ?? null);
    setEditDialogOpen(true);
  }, []);

  const openDeleteDialog = useCallback((song?: Song) => {
    setSelectedSong(song ?? null);
    setDeleteDialogOpen(true);
  }, []);

  const {
    isPending: isSongPending,
    error: songError,
    data: songs,
    refetch: refetchSong,
  } = useAllSongsQuery();

  const { mutate: randomMutate, isPending: isRandomPending } = useMutation({
    mutationFn: randomMysteryOrder,
    onSuccess: async () => {
      await refetchSong();
    },
    onError: (error) => {
      toast.error("随机失败。");
      console.error(error);
    },
  });

  const actionCellRenderer = useCallback(
    (params: CustomCellRendererProps<Song>) => (
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

  const columnDefs: ColDef<Song>[] = useMemo(
    () => [
      { headerName: "ID", field: "id", width: 100 },
      { headerName: "OD", field: "mysteryOrder", width: 100 },
      {
        headerName: "歌曲 ID",
        field: "metadata.id",
        flex: 1,
      },
      {
        headerName: "等级",
        field: "metadata",
        cellRenderer: ChartDifficultyCellRenderer,
        comparator: (
          vA: SongMetadata,
          vB: SongMetadata,
          _nA,
          _nB,
          isDescending,
        ) => {
          const maxA = Math.max(
            ...vA.difficulties.map((d) => d.rating + (d.ratingPlus ? 0.5 : 0)),
          );
          const maxB = Math.max(
            ...vB.difficulties.map((d) => d.rating + (d.ratingPlus ? 0.5 : 0)),
          );

          return isDescending ? maxB - maxA : maxA - maxB;
        },
        flex: 1,
      },
      {
        headerName: "马甲",
        field: "metadata",
        cellRenderer: ChartDesignerCellRenderer,
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
    [actionCellRenderer],
  );

  const gridRef = useRef<AgGridReact<Song>>(null);

  return (
    <section className="mx-2 space-y-2">
      <header className="flex items-center space-x-2 border-2 p-2 rounded-xl">
        <Button onClick={openAddDialog} variant="default">
          新增歌曲
        </Button>
        <Button
          onClick={() => randomMutate()}
          disabled={isRandomPending}
          variant="default"
        >
          随机顺位
        </Button>
      </header>

      {songError && (
        <Alert variant="destructive">
          <AlertDescription>加载失败：{songError?.message}</AlertDescription>
        </Alert>
      )}

      {!songError && (
        <Grid<Song>
          ref={gridRef}
          rowData={songs}
          columnDefs={columnDefs}
          domLayout="autoHeight"
          suppressClickEdit={true}
          loading={isSongPending}
        />
      )}

      <UpsertSongDialog
        open={editDialogOpen}
        setOpen={setEditDialogOpen}
        initial={selectedSong}
        onSuccess={refetchSong}
      />

      {selectedSong && (
        <DeleteSongDialog
          open={deleteDialogOpen}
          setOpen={setDeleteDialogOpen}
          song={selectedSong}
          onSuccess={refetchSong}
        />
      )}
    </section>
  );
}
