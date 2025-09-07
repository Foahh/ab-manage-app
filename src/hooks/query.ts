import { useQuery } from "@tanstack/react-query";
import { getAllSongs } from "@/actions/song-action";
import { getAllSongers, getSomeSongers } from "@/actions/songer-action";
import { getAllUsers } from "@/actions/user-action";

export const QUERY_KEYS = {
  USERS: "USERS",
  SONGS: "SONGS",
  SONGERS: "SONGERS",
};

export function useAllUsersQuery() {
  return useQuery({
    queryKey: [QUERY_KEYS.USERS],
    queryFn: getAllUsers,
    staleTime: 10 * 60 * 1000,
  });
}

export function useAllSongsQuery() {
  return useQuery({
    queryKey: [QUERY_KEYS.SONGS],
    queryFn: getAllSongs,
    staleTime: 10 * 60 * 1000,
  });
}

export function useAllSongersQuery({
  enabled = true,
}: { enabled?: boolean } | undefined = {}) {
  return useQuery({
    enabled,
    queryKey: [QUERY_KEYS.SONGERS],
    queryFn: getAllSongers,
    staleTime: 10 * 60 * 1000,
  });
}

export function useSomeSongersQuery(songId: number) {
  return useQuery({
    queryKey: [QUERY_KEYS.SONGERS, songId],
    queryFn: () => getSomeSongers(songId),
    staleTime: 10 * 60 * 1000,
  });
}
