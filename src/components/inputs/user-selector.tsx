"use client";

import { Check, ChevronsUpDown } from "lucide-react";
import { type Ref, useMemo, useState } from "react";
import type { User } from "@/actions/user-action";
import { Badge } from "@/components/ui/badge";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useAllUsersQuery } from "@/hooks/query";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";

interface UserSelectorProps {
  ref?: Ref<HTMLButtonElement>;
  value: number | null;
  onValueChange?: (value: number | null) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  showClearButton?: boolean;
  modalPopover?: boolean;
}

export function UserSelector({
  ref,
  value,
  onValueChange,
  placeholder = "请选择用户",
  disabled = false,
  className,
  showClearButton = true,
  modalPopover = false,
}: UserSelectorProps) {
  const { data: users = [], isPending, isError } = useAllUsersQuery();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filteredUsers = useMemo(() => {
    if (!search.trim()) {
      return users;
    }
    return users.filter((u: User) =>
      u.name.toLowerCase().includes(search.trim().toLowerCase()),
    );
  }, [search, users]);

  const selectedUser = users.find((u: User) => u.id === value);

  const handleSelect = (userId: number | null) => {
    onValueChange?.(userId);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen} modal={modalPopover}>
      <PopoverTrigger asChild>
        <Button
          ref={ref}
          variant="outline"
          role="combobox"
          className={cn(
            "min-w-[220px] justify-between",
            !value && "text-muted-foreground",
            className,
          )}
          disabled={disabled || isPending}
        >
          <span className="flex gap-1">
            {selectedUser ? selectedUser.name : placeholder}
            {selectedUser?.isJammer && <Badge variant="outline">干扰</Badge>}
          </span>

          <ChevronsUpDown className="ml-2 opacity-50 shrink-0" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="min-w-[220px] p-0 z-50">
        <Command>
          <CommandInput
            placeholder="搜索用户..."
            className="h-9"
            autoFocus
            value={search}
            onValueChange={setSearch}
            disabled={isPending}
          />
          <CommandList>
            {isPending && (
              <div className="p-4 text-center text-sm text-muted-foreground">
                正在加载用户...
              </div>
            )}
            {isError && (
              <div className="p-4 text-center text-sm text-destructive">
                用户加载失败
              </div>
            )}
            {!isPending && !isError && filteredUsers.length === 0 && (
              <CommandEmpty>没有找到用户</CommandEmpty>
            )}
            <CommandGroup>
              <CommandItem
                value=""
                key="none"
                onSelect={() => handleSelect(null)}
              >
                <span>未选择</span>
                <Check
                  className={cn(
                    "ml-auto",
                    !value ? "opacity-100" : "opacity-0",
                  )}
                />
              </CommandItem>
              {filteredUsers.map((user: User) => (
                <CommandItem
                  value={user.name}
                  key={user.id}
                  onSelect={() => handleSelect(user.id)}
                >
                  <span className="flex gap-1">
                    {user.name}
                    {user.isJammer && <Badge variant="outline">干扰</Badge>}
                  </span>
                  <Check
                    className={cn(
                      "ml-auto",
                      value === user.id ? "opacity-100" : "opacity-0",
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
          {value && showClearButton && (
            <Button
              variant="ghost"
              className="p-2 w-full rounded-t-none"
              size="sm"
              onClick={() => handleSelect(null)}
            >
              清空选择
            </Button>
          )}
        </Command>
      </PopoverContent>
    </Popover>
  );
}
