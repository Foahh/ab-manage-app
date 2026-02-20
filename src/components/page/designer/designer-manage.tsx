"use client";

import { useMutation } from "@tanstack/react-query";
import type { ColDef } from "ag-grid-community";
import type { AgGridReact, CustomCellRendererProps } from "ag-grid-react";
import { Pen, Trash } from "lucide-react";
import { useCallback, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { randomAssignDesigners } from "@/actions/random-designer-action";
import type { Designer } from "@/actions/designer-action";
import Grid from "@/components/grid/ag-grid";
import { DeleteDesignerDialog } from "@/components/page/designer/delete-designer-dialog";
import { UpsertDesignerDialog } from "@/components/page/designer/upsert-designer-dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  useAllDesignersQuery,
  useAllSongsQuery,
  useAllUsersQuery,
} from "@/hooks/query";

export function DesignerManage() {
  const { data: users } = useAllUsersQuery();
  const { data: songs } = useAllSongsQuery();
  const {
    isPending: isDesignerPending,
    error: designerError,
    data: designers,
    refetch: refetchSong,
  } = useAllDesignersQuery();

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedDesigner, setSelectedDesigner] = useState<Designer | null>(
    null,
  );

  const openAddDialog = useCallback(() => {
    setSelectedDesigner(null);
    setEditDialogOpen(true);
  }, []);

  const openEditDialog = useCallback((designer?: Designer) => {
    setSelectedDesigner(designer ?? null);
    setEditDialogOpen(true);
  }, []);

  const openDeleteDialog = useCallback((designer?: Designer) => {
    setSelectedDesigner(designer ?? null);
    setDeleteDialogOpen(true);
  }, []);

  const actionCellRenderer = useCallback(
    (params: CustomCellRendererProps<Designer>) => (
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

  const columnDefs: ColDef<Designer>[] = useMemo(
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

  const gridRef = useRef<AgGridReact<Designer>>(null);

  const relatedDesigners = useMemo(() => {
    return (
      designers?.filter((s) => s.songId === selectedDesigner?.songId) || []
    );
  }, [selectedDesigner?.songId, designers]);

  const randomMutate = useMutation({
    mutationFn: randomAssignDesigners,
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

      {designerError && (
        <Alert variant="destructive">
          <AlertDescription>
            加载失败：{designerError?.message}
          </AlertDescription>
        </Alert>
      )}

      {!designerError && (
        <Grid<Designer>
          ref={gridRef}
          rowData={designers}
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
        initialSongId={selectedDesigner?.songId}
        initialDesigners={relatedDesigners}
        onSuccess={refetchSong}
      />

      {selectedDesigner && (
        <DeleteDesignerDialog
          open={deleteDialogOpen}
          setOpen={setDeleteDialogOpen}
          designer={selectedDesigner}
          onSuccess={refetchSong}
        />
      )}
    </section>
  );
}
