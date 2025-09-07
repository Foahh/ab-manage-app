"use client";

import type { CustomCellRendererProps } from "ag-grid-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { SongMetadata } from "@/lib/arcaea/song-schema";

export const difficultyColors = [
  "bg-green-100 text-green-800 border-green-200",
  "bg-yellow-100 text-yellow-800 border-yellow-200",
  "bg-purple-100 text-purple-800 border-purple-200",
  "bg-red-100 text-red-800 border-red-200",
  "bg-gray-100 text-gray-800 border-gray-200",
];

export function ChartDesignerCellRenderer(
  params: CustomCellRendererProps<unknown, SongMetadata>,
) {
  const metadata = params.value;
  if (!metadata?.difficulties) {
    return null;
  }

  const validDifficulties = metadata.difficulties.filter(
    (d) => d.rating >= 0 && d.chartDesigner.trim() !== "",
  );

  return (
    <div className="flex gap-1 flex-wrap h-full items-center">
      {validDifficulties.map((difficulty, index) => (
        <Badge
          key={`${difficulty.ratingClass}-${index}`}
          variant="outline"
          className={cn(
            difficultyColors[difficulty.ratingClass] || difficultyColors[4],
            "items-center justify-self-center",
          )}
        >
          {difficulty.chartDesigner}
        </Badge>
      ))}
    </div>
  );
}

export function ChartDifficultyCellRenderer(
  params: CustomCellRendererProps<unknown, SongMetadata>,
) {
  const metadata = params.value;
  if (!metadata?.difficulties) {
    return null;
  }

  const validDifficulties = metadata.difficulties.filter((d) => d.rating >= 0);

  return (
    <div className="flex gap-1 flex-wrap h-full items-center">
      {validDifficulties.map((difficulty, index) => (
        <Badge
          key={`${difficulty.ratingClass}-${index}`}
          variant="outline"
          className={cn(
            difficultyColors[difficulty.ratingClass] || difficultyColors[4],
            "items-center justify-self-center",
          )}
        >
          {difficulty.rating}
          {difficulty.ratingPlus ? "+" : ""}
        </Badge>
      ))}
    </div>
  );
}
