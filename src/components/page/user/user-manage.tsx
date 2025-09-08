import type { CellValueChangedEvent, ColDef } from "ag-grid-community";
import type { AgGridReact } from "ag-grid-react";
import { Pen, Trash } from "lucide-react";
import { useCallback, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { editUser, type User } from "@/actions/user-action";
import Grid from "@/components/grid/ag-grid";
import { BilibiliCellRenderer } from "@/components/grid/bilibili-cell-renderer";
import { DeleteUserDialog } from "@/components/page/user/delete-user-dialog";
import { UpsertUserDialog } from "@/components/page/user/upsert-user-dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useAllUsersQuery } from "@/hooks/query";

export function UserManage() {
  const { isPending, error, data: users, refetch } = useAllUsersQuery();

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const openAddDialog = useCallback(() => {
    setSelectedUser(null);
    setEditDialogOpen(true);
  }, []);

  const openEditDialog = useCallback((user?: User) => {
    setSelectedUser(user ?? null);
    setEditDialogOpen(true);
  }, []);

  const openDeleteDialog = useCallback((user?: User) => {
    setSelectedUser(user ?? null);
    setDeleteDialogOpen(true);
  }, []);

  const actionCellRenderer = useCallback(
    (params: { data?: User }) => (
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

  const columnDefs: ColDef<User>[] = useMemo(
    () => [
      { headerName: "ID", field: "id", width: 50 },
      { headerName: "昵称", field: "name", flex: 1, editable: true },
      { headerName: "联系方式", field: "contact", flex: 1, editable: true },
      {
        headerName: "Bilibili",
        field: "bilibili",
        flex: 1,
        editable: true,
        cellRenderer: BilibiliCellRenderer,
      },
      {
        headerName: "更新于",
        field: "updated_at",
        width: 160,
        valueFormatter: (params) => params.value.toLocaleString(),
      },
      {
        headerName: "操作",
        width: 100,
        cellRenderer: actionCellRenderer,
        sortable: false,
        filter: false,
        editable: false,
      },
    ],
    [actionCellRenderer],
  );

  const onCellValueChanged = useCallback(
    async (event: CellValueChangedEvent<User>) => {
      const { data, oldValue, newValue, colDef } = event;

      // biome-ignore lint/suspicious/noDoubleEquals: <coerce>
      if (oldValue == newValue || !colDef?.field) {
        return;
      }

      try {
        await editUser(data.id, { [colDef.field]: newValue ?? null });
        toast.success("谱师信息已更新。");
        await refetch();
      } catch (err) {
        toast.error("更新失败。");
        console.error(err);
        await refetch();
      }
    },
    [refetch],
  );

  const gridRef = useRef<AgGridReact<User>>(null);

  return (
    <section className="mx-2 space-y-2">
      <header className="flex items-center space-x-2 border-2 p-2 rounded-xl">
        <Button onClick={openAddDialog} variant="default">
          新增谱师
        </Button>
      </header>
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>加载失败：{error?.message}</AlertDescription>
        </Alert>
      )}
      {!error && (
        <Grid<User>
          ref={gridRef}
          rowData={users}
          columnDefs={columnDefs}
          domLayout="autoHeight"
          onCellValueChanged={onCellValueChanged}
          loading={isPending}
        />
      )}
      <UpsertUserDialog
        open={editDialogOpen}
        setOpen={setEditDialogOpen}
        initial={selectedUser}
        onSuccess={refetch}
      />
      {selectedUser && (
        <DeleteUserDialog
          open={deleteDialogOpen}
          setOpen={setDeleteDialogOpen}
          user={selectedUser}
          onSuccess={refetch}
        />
      )}
    </section>
  );
}
