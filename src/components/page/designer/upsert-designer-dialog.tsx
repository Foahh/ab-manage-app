import { useMutation } from "@tanstack/react-query";
import { Plus, Trash2 } from "lucide-react";
import { useEffect, useMemo } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";
import { MultipleCustomDesignersSchema } from "@/actions/schemas/custom-designer-action-schema";
import {
  type Designer,
  updateMultipleDesigners,
} from "@/actions/designer-action";
import {
  updateMultipleCustomDesigners,
  type CustomDesigner,
} from "@/actions/custom-designer-action";
import { editSong } from "@/actions/song-action";
import { RoleSelectField } from "@/components/form/role-select-field";
import { SongSelectField } from "@/components/form/song-select-field";
import { UserSelectField } from "@/components/form/user-select-field";
import { Button } from "@/components/ui/button";
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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CustomRoleSelect } from "@/components/inputs/custom-role-select";

type FormData = {
  songId?: number;
  usingCustomDesigners: boolean;
  designers: Array<{ userId?: number; role: "real" | "fake_assigned" | "fake_random" }>;
  customDesigners: Array<{ label: string; role: "real" | "fake" }>;
};

const defaultDesigners: FormData["designers"] = [
  { userId: undefined, role: "fake_assigned" },
];
const defaultCustomDesigners: FormData["customDesigners"] = [
  { label: "", role: "fake" },
];

type UpsertDesignerDialogProps = {
  open: boolean;
  setOpen: (open: boolean) => void;
  initialSongId?: number;
  initialDesigners: Designer[];
  initialCustomDesigners: CustomDesigner[];
  usingCustomDesigners: boolean;
  onSuccess?: () => void;
};

export function UpsertDesignerDialog({
  open,
  setOpen,
  initialSongId,
  initialDesigners,
  initialCustomDesigners,
  usingCustomDesigners,
  onSuccess,
}: UpsertDesignerDialogProps) {
  const defaultValues = useMemo((): FormData => {
    const designers =
      initialDesigners.length > 0
        ? initialDesigners.map((d) => ({ userId: d.userId, role: d.role }))
        : defaultDesigners;
    const customDesigners =
      initialCustomDesigners.length > 0
        ? initialCustomDesigners.map((d) => ({ label: d.label, role: d.role }))
        : defaultCustomDesigners;

    return {
      songId: initialSongId,
      usingCustomDesigners,
      designers,
      customDesigners,
    };
  }, [
    initialSongId,
    initialDesigners,
    initialCustomDesigners,
    usingCustomDesigners,
  ]);

  const form = useForm<FormData>({
    defaultValues,
    mode: "onTouched",
  });

  const {
    fields: designerFields,
    append: appendDesigner,
    remove: removeDesigner,
  } = useFieldArray({ control: form.control, name: "designers" });
  const {
    fields: customFields,
    append: appendCustomDesigner,
    remove: removeCustomDesigner,
  } = useFieldArray({ control: form.control, name: "customDesigners" });

  const usingCustom = form.watch("usingCustomDesigners");

  useEffect(() => {
    if (open) {
      form.reset(defaultValues);
    }
  }, [open, defaultValues, form]);

  const mutation = useMutation({
    mutationFn: async (data: FormData) => {
      if (data.songId == null) {
        throw new Error("请选择歌曲");
      }
      const songId = data.songId;

      if (data.usingCustomDesigners) {
        const parsed = MultipleCustomDesignersSchema.parse({
          songId,
          designers: data.customDesigners.filter((d) => d.label.trim().length > 0),
        });
        if (parsed.designers.length === 0) {
          throw new Error("请至少添加一个自定义谱师并填写名称");
        }
        await updateMultipleCustomDesigners(parsed);
      } else {
        const validDesigners = data.designers.filter(
          (d): d is { userId: number; role: FormData["designers"][0]["role"] } =>
            d.userId != null,
        );
        if (validDesigners.length === 0) {
          throw new Error("请至少选择一个谱师");
        }
        await updateMultipleDesigners({ songId, designers: validDesigners });
      }
      await editSong(songId, { usingCustomDesigners: data.usingCustomDesigners });
    },
    onSuccess: () => {
      toast.success("选项信息已更新。");
      setOpen(false);
      onSuccess?.();
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "操作失败。");
      console.error(error);
    },
  });

  const onSubmit = form.handleSubmit((data) => {
    mutation.mutate(data);
  });

  const addDesigner = () => {
    appendDesigner({ userId: undefined, role: "fake_assigned" });
  };
  const addCustomDesigner = () => {
    appendCustomDesigner({ label: "", role: "fake" });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>编辑选项</DialogTitle>
          <DialogDescription>完成后点击保存。可切换「用户选择」与「自定义文本」，已填数据会保留。</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={onSubmit} className="space-y-4">
            <fieldset
              disabled={mutation.isPending}
              className="w-full space-y-2"
            >
              <SongSelectField
                modalPopover={true}
                disabled={initialSongId !== undefined}
                hideSelected={true}
                control={form.control}
                name="songId"
                label="歌曲"
              />

              <FormField
                control={form.control}
                name="usingCustomDesigners"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>模式</FormLabel>
                    <FormControl>
                      <Select
                        value={field.value ? "custom" : "user"}
                        onValueChange={(v) => field.onChange(v === "custom")}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="user">用户选择</SelectItem>
                          <SelectItem value="custom">自定义文本</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {!usingCustom && (
                <>
                  <div className="space-y-2">
                    {designerFields.map((field, index) => (
                      <div
                        key={field.id}
                        className="flex items-end gap-2 p-3 border rounded-lg"
                      >
                        <div className="flex-1">
                          <UserSelectField
                            modalPopover={true}
                            control={form.control}
                            name={`designers.${index}.userId`}
                            label="谱师"
                          />
                        </div>
                        <div className="flex-1">
                          <RoleSelectField
                            control={form.control}
                            name={`designers.${index}.role`}
                            label="角色"
                          />
                        </div>
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          onClick={() => removeDesigner(index)}
                          disabled={designerFields.length === 1}
                          className="shrink-0"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addDesigner}
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    添加选项
                  </Button>
                </>
              )}

              {usingCustom && (
                <>
                  <div className="space-y-2">
                    {customFields.map((field, index) => (
                      <div
                        key={field.id}
                        className="flex items-end gap-2 p-3 border rounded-lg"
                      >
                        <div className="flex-1">
                          <FormField
                            control={form.control}
                            name={`customDesigners.${index}.label`}
                            render={({ field: f }) => (
                              <FormItem>
                                <FormLabel>谱师名称</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="填写自定义谱师名称"
                                    {...f}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <div className="flex-1">
                          <FormField
                            control={form.control}
                            name={`customDesigners.${index}.role`}
                            render={({ field: f }) => (
                              <FormItem>
                                <FormLabel>角色</FormLabel>
                                <FormControl>
                                  <CustomRoleSelect
                                    value={f.value}
                                    onValueChange={f.onChange}
                                    placeholder="选择角色"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          onClick={() => removeCustomDesigner(index)}
                          disabled={customFields.length === 1}
                          className="shrink-0"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addCustomDesigner}
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    添加自定义谱师
                  </Button>
                </>
              )}

              {mutation.isError && (
                <p className="text-destructive text-sm" role="alert">
                  {mutation.error instanceof Error
                    ? mutation.error.message
                    : "操作失败。"}
                </p>
              )}
            </fieldset>
            <DialogFooter>
              <Button
                type="button"
                variant="secondary"
                onClick={() => setOpen(false)}
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
