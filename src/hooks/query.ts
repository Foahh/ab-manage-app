import { useQuery } from "@tanstack/react-query";
import { getAllSongs } from "@/actions/song-action";
import { getAllDesigners, getSomeDesigners } from "@/actions/designer-action";
import { getAllUsers } from "@/actions/user-action";

export const QUERY_KEYS = {
  USERS: "USERS",
  SONGS: "SONGS",
  DESIGNERS: "DESIGNERS",
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

export function useAllDesignersQuery({
  enabled = true,
}: { enabled?: boolean } | undefined = {}) {
  return useQuery({
    enabled,
    queryKey: [QUERY_KEYS.DESIGNERS],
    queryFn: getAllDesigners,
    staleTime: 10 * 60 * 1000,
  });
}

export function useSomeDesignersQuery(songId: number) {
  return useQuery({
    queryKey: [QUERY_KEYS.DESIGNERS, songId],
    queryFn: () => getSomeDesigners(songId),
    staleTime: 10 * 60 * 1000,
  });
}
