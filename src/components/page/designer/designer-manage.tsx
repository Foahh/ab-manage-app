"use client";

import { useMutation } from "@tanstack/react-query";
import type { ColDef } from "ag-grid-community";
import type { AgGridReact, CustomCellRendererProps } from "ag-grid-react";
import { Pen, Trash } from "lucide-react";
import { useCallback, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { randomAssignDesigners } from "@/actions/random-designer-action";
import type { Designer } from "@/actions/designer-action";
import type { CustomDesigner } from "@/actions/custom-designer-action";
import type { Song } from "@/actions/song-action";
import Grid from "@/components/grid/ag-grid";
import { DeleteDesignerDialog } from "@/components/page/designer/delete-designer-dialog";
import { UpsertDesignerDialog } from "@/components/page/designer/upsert-designer-dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  useAllDesignersQuery,
  useAllSongsQuery,
  useAllUsersQuery,
  useAllCustomDesignersQuery,
} from "@/hooks/query";

export type DesignerGridRow =
  | (Designer & { kind: "user" })
  | (CustomDesigner & { kind: "custom" });

function isUserRow(row: DesignerGridRow): row is Designer & { kind: "user" } {
  return row.kind === "user";
}

export function DesignerManage() {
  const { data: users } = useAllUsersQuery();
  const { data: songs } = useAllSongsQuery();
  const {
    isPending: isDesignerPending,
    error: designerError,
    data: designers,
    refetch: refetchDesigners,
  } = useAllDesignersQuery();
  const {
    data: customDesigners,
    refetch: refetchCustomDesigners,
  } = useAllCustomDesignersQuery();
  const { refetch: refetchSongs } = useAllSongsQuery();

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedSongIdForEdit, setSelectedSongIdForEdit] = useState<number | null>(null);
  const [selectedDesignerForDelete, setSelectedDesignerForDelete] = useState<Designer | null>(null);

  const openAddDialog = useCallback(() => {
    setSelectedSongIdForEdit(null);
    setEditDialogOpen(true);
  }, []);

  const openEditDialog = useCallback((row: DesignerGridRow) => {
    setSelectedSongIdForEdit(row.songId);
    setEditDialogOpen(true);
  }, []);

  const openDeleteDialog = useCallback((designer: Designer) => {
    setSelectedDesignerForDelete(designer);
    setDeleteDialogOpen(true);
  }, []);

  const actionCellRenderer = useCallback(
    (params: CustomCellRendererProps<DesignerGridRow>) => {
      const row = params.data;
      if (!row) {
        return null;
      }
      const canDelete = isUserRow(row);
      return (
        <div className="flex gap-1.5 w-full h-full justify-center items-center">
          <Button
            className="size-8"
            onClick={() => openEditDialog(row)}
          >
            <Pen />
          </Button>
          {canDelete && (
            <Button
              className="size-8"
              variant="destructive"
              onClick={() => openDeleteDialog(row as Designer)}
            >
              <Trash />
            </Button>
          )}
        </div>
      );
    },
    [openEditDialog, openDeleteDialog],
  );

  const columnDefs: ColDef<DesignerGridRow>[] = useMemo(
    () => [
      {
        headerName: "歌曲",
        field: "songId",
        flex: 1,
        valueFormatter: (params) => {
          const song = songs?.find((s) => s.id === params.value);
          return song ? song.metadata.id : "未知歌曲";
        },
        spanRows: true,
      },
      {
        headerName: "模式",
        flex: 0.5,
        valueFormatter: (params) => {
          return params.data?.kind === "custom" ? "自定义" : "用户选择";
        },
        spanRows: true,
      },
      {
        headerName: "谱师",
        flex: 1,
        valueFormatter: (params) => {
          const row = params.data;
          if (!row) {
            return "";
          }
          if (row.kind === "user") {
            const user = users?.find((u) => u.id === row.userId);
            return user ? user.name : "未知谱师";
          }
          return row.label;
        },
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
        valueFormatter: (params) =>
          params.value ? new Date(params.value).toLocaleString() : "",
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

  const gridRef = useRef<AgGridReact<DesignerGridRow>>(null);

  const rowData = useMemo((): DesignerGridRow[] => {
    if (!songs || (!designers && !customDesigners)) {
      return [];
    }
    const rows: DesignerGridRow[] = [];
    for (const song of songs) {
      const useCustom = song.usingCustomDesigners;
      if (useCustom && customDesigners) {
        const list = customDesigners.filter((c) => c.songId === song.id);
        for (const c of list) {
          rows.push({ ...c, kind: "custom" as const });
        }
      }
      if (!useCustom && designers) {
        const list = designers.filter((d) => d.songId === song.id);
        for (const d of list) {
          rows.push({ ...d, kind: "user" as const });
        }
      }
    }
    return rows;
  }, [songs, designers, customDesigners]);

  const selectedSong = useMemo(
    () => (songs?.find((s) => s.id === selectedSongIdForEdit) ?? null) as Song | null,
    [songs, selectedSongIdForEdit],
  );
  const relatedDesigners = useMemo(
    () => designers?.filter((s) => s.songId === selectedSongIdForEdit) ?? [],
    [selectedSongIdForEdit, designers],
  );
  const relatedCustomDesigners = useMemo(
    () => customDesigners?.filter((c) => c.songId === selectedSongIdForEdit) ?? [],
    [selectedSongIdForEdit, customDesigners],
  );

  const refetchAll = useCallback(() => {
    refetchDesigners();
    refetchCustomDesigners();
    refetchSongs();
  }, [refetchDesigners, refetchCustomDesigners, refetchSongs]);

  const randomMutate = useMutation({
    mutationFn: randomAssignDesigners,
    onSuccess: async () => {
      toast.success("随机分配成功");
      await refetchAll();
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

      {designerError && (
        <Alert variant="destructive">
          <AlertDescription>
            加载失败：{designerError?.message}
          </AlertDescription>
        </Alert>
      )}

      {!designerError && (
        <Grid<DesignerGridRow>
          ref={gridRef}
          rowData={rowData}
          columnDefs={columnDefs}
          domLayout="autoHeight"
          suppressClickEdit={true}
          loading={isDesignerPending}
          enableCellSpan
        />
      )}

      <UpsertDesignerDialog
        open={editDialogOpen}
        setOpen={setEditDialogOpen}
        initialSongId={selectedSongIdForEdit ?? undefined}
        initialDesigners={relatedDesigners}
        initialCustomDesigners={relatedCustomDesigners}
        usingCustomDesigners={selectedSong?.usingCustomDesigners ?? false}
        onSuccess={refetchAll}
      />

      {selectedDesignerForDelete && (
        <DeleteDesignerDialog
          open={deleteDialogOpen}
          setOpen={setDeleteDialogOpen}
          designer={selectedDesignerForDelete}
          onSuccess={refetchDesigners}
        />
      )}
    </section>
  );
}
