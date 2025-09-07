import { AG_GRID_LOCALE_CN } from "@ag-grid-community/locale";
import {
  AllCommunityModule,
  colorSchemeDark,
  ModuleRegistry,
  themeQuartz,
} from "ag-grid-community";
import { AgGridReact, type AgGridReactProps } from "ag-grid-react";
import type React from "react";

ModuleRegistry.registerModules([AllCommunityModule]);

const myTheme = themeQuartz.withPart(colorSchemeDark);

type GridProps<TData> = AgGridReactProps<TData> & {
  ref?: React.RefObject<AgGridReact<TData> | null>;
};

export default function Grid<TData>(props: GridProps<TData>) {
  return (
    <AgGridReact<TData>
      theme={myTheme}
      localeText={AG_GRID_LOCALE_CN}
      {...props}
    />
  );
}
