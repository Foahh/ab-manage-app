"use client";

import { Check, ChevronsUpDown } from "lucide-react";
import { type Ref, useMemo, useState } from "react";
import type { Song } from "@/actions/song-action";
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
import { useAllSongersQuery, useAllSongsQuery } from "@/hooks/query";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";

interface SongSelectorProps {
  ref?: Ref<HTMLButtonElement>;
  value: number | null;
  onValueChange?: (value: number | null) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  showClearButton?: boolean;
  modalPopover?: boolean;
  hideSelected?: boolean;
}

export function SongSelector({
  ref,
  value,
  onValueChange,
  placeholder = "请选择歌曲",
  disabled = false,
  className,
  showClearButton = true,
  modalPopover = false,
  hideSelected,
}: SongSelectorProps) {
  const { data: songs = [], isPending, isError } = useAllSongsQuery();
  const { data: songers } = useAllSongersQuery({
    enabled: hideSelected,
  });

  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filteredSongs = useMemo(() => {
    const notSelected = songs
      .filter((s) => !s.isBonus)
      .filter((s) => {
        if (!songers || !hideSelected) {
          return true;
        }
        return !songers.some((songer) => songer.songId === s.id);
      });

    if (!search.trim()) {
      return notSelected;
    }
    return notSelected.filter((s: Song) =>
      s.metadata.id.toLowerCase().includes(search.trim().toLowerCase()),
    );
  }, [search, songs, songers, hideSelected]);

  const selectedSong = songs.find((s: Song) => s.id === value);

  const handleSelect = (songId: number | null) => {
    onValueChange?.(songId);
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
          {selectedSong ? selectedSong.metadata.id : placeholder}
          <ChevronsUpDown className="ml-2 opacity-50 shrink-0" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="min-w-[220px] p-0 z-50">
        <Command>
          <CommandInput
            placeholder="搜索歌曲..."
            className="h-9"
            autoFocus
            value={search}
            onValueChange={setSearch}
            disabled={isPending}
          />
          <CommandList>
            {isPending && (
              <div className="p-4 text-center text-sm text-muted-foreground">
                正在加载歌曲...
              </div>
            )}
            {isError && (
              <div className="p-4 text-center text-sm text-destructive">
                歌曲加载失败
              </div>
            )}
            {!isPending && !isError && filteredSongs.length === 0 && (
              <CommandEmpty>没有找到歌曲</CommandEmpty>
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
              {filteredSongs.map((song: Song) => (
                <CommandItem
                  value={song.metadata.id}
                  key={song.id}
                  onSelect={() => handleSelect(song.id)}
                >
                  <span>{song.metadata.id}</span>
                  <Check
                    className={cn(
                      "ml-auto",
                      value === song.id ? "opacity-100" : "opacity-0",
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
