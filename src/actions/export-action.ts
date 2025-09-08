"use server";

import * as fs from "node:fs/promises";
import * as path from "node:path";
import { db } from "@/db";
import { songsTable } from "@/db/schemas/songs-table";
import type { PackMetadata } from "@/lib/arcaea/pack-schema";
import type { SongMetadata } from "@/lib/arcaea/song-schema";

const dataDir = `${process.cwd()}/data`;
const bgDir = `${dataDir}/bg`;
const songsDir = `${dataDir}/songs`;
const assetsDir = `${dataDir}/assets`;

export type ExportPackOptions = {
  packMeta: PackMetadata;
  mysteryBox?: boolean;
};

function difficultyFilter(d: { rating: number }) {
  return d.rating >= 0;
}

async function exists(path: string): Promise<boolean> {
  try {
    await fs.access(path);
    return true;
  } catch {
    return false;
  }
}

async function validateSongFolders(metas: SongMetadata[]) {
  console.log("Step 1: Validating song folders...");

  for (const meta of metas) {
    const songPath = path.join(songsDir, meta.id);

    if (!(await exists(songPath))) {
      throw new Error(`Song folder not found: ${songPath}`);
    }
  }
}

async function validateChartFiles(metas: SongMetadata[]) {
  console.log("Step 2: Validating chart files...");

  for (const meta of metas) {
    const songPath = path.join(songsDir, meta.id);

    const affFiles = (await fs.readdir(songPath)).filter((f) =>
      f.endsWith(".aff"),
    );

    const expected = meta.difficulties
      .filter(difficultyFilter)
      .map((d) => d.ratingClass.toString());

    const found = affFiles.map((f) => path.basename(f, ".aff"));

    for (const e of expected) {
      if (!found.includes(e)) {
        throw new Error(
          `Missing chart file for difficulty '${e}' in song '${meta.id}'`,
        );
      }
    }

    for (const f of found) {
      if (!expected.includes(f)) {
        console.warn(`Extra chart file found: '${f}.aff' in song '${meta.id}'`);
      }
    }
  }
}

function updateMysteryBoxMetadata(
  metaOrders: Record<string, number>,
  metas: SongMetadata[],
  packId: string,
) {
  const updated: SongMetadata[] = structuredClone(metas);

  const originalMap: Map<SongMetadata, SongMetadata> = new Map();
  for (let i = 0; i < updated.length; i++) {
    originalMap.set(updated[i], metas[i]);
  }

  updated.sort((a, b) => {
    const orderA = metaOrders[a.id] ?? Number.MAX_SAFE_INTEGER;
    const orderB = metaOrders[b.id] ?? Number.MAX_SAFE_INTEGER;
    return orderA - orderB;
  });

  const pads = metas.length.toString().length;
  for (let idx = 0; idx < updated.length; idx++) {
    const meta = updated[idx];
    const padId = String(idx + 1).padStart(pads, "0");
    meta.id = `mystery${padId}`;
    meta.set = packId;
    meta.date = Date.now();
    meta.title_localized = { en: `#${padId}` };
    meta.artist = "";
    meta.artist_localized = { en: meta.artist };
    meta.audioPreview = 0;
    meta.audioPreviewEnd = 1;
    meta.version = "";
    delete meta.source_localized;
    delete meta.source_copyright;
  }

  return { updated, originalMap };
}

function updateStandardMetadata(
  metas: SongMetadata[],
  packId: string,
  date: number,
) {
  const updated: SongMetadata[] = structuredClone(metas);
  const originalMap: Map<SongMetadata, SongMetadata> = new Map();

  for (let i = 0; i < updated.length; i++) {
    originalMap.set(updated[i], metas[i]);
    updated[i].set = packId;
    updated[i].date = date;
  }

  return { updated, originalMap };
}

async function buildFileMap(
  packMetadata: PackMetadata,
  updated: SongMetadata[],
  originalMap: Map<SongMetadata, SongMetadata>,
  exportDir: string,
  songsExportPath: string,
  mysteryBox: boolean | undefined,
) {
  console.log("Step 5: Mapping files...");
  const map: Map<string, string[]> = new Map();

  for (const meta of updated) {
    const originalMeta = originalMap.get(meta);
    if (!originalMeta) {
      throw new Error(`Could not find original metadata for song: ${meta.id}`);
    }

    const originalSongPath = path.join(songsDir, originalMeta.id);
    const newSongPath = path.join(songsExportPath, meta.id);
    if (!(await exists(newSongPath))) {
      await fs.mkdir(newSongPath, { recursive: true });
    }
    const allFiles = await fs.readdir(originalSongPath);

    for (const file of allFiles) {
      const originalFilePath = path.join(originalSongPath, file);
      const newFilePath = path.join(newSongPath, file);

      let sourcePath = originalFilePath;

      if (mysteryBox) {
        if (file === "base.jpg" || file === "base_256.jpg") {
          sourcePath = path.join(assetsDir, file);
        } else if (/^[0-9]+(_256)?\.jpg$/.test(file)) {
          sourcePath = path.join(
            assetsDir,
            file.includes("_256") ? "base_256.jpg" : "base.jpg",
          );
        }
      }

      const existing = map.get(sourcePath);

      if (existing) {
        existing.push(newFilePath);
      } else {
        map.set(sourcePath, [newFilePath]);
      }
    }
  }

  const bgFiles = await fs.readdir(bgDir);
  for (const file of bgFiles) {
    const sourcePath = path.join(bgDir, file);
    const targetPath = path.join(exportDir, "bg", file);
    const existing = map.get(sourcePath);

    if (existing) {
      existing.push(targetPath);
    } else {
      map.set(sourcePath, [targetPath]);
    }
  }

  const sourcePackPath = path.join(assetsDir, "select.png");
  const targetPackPath = path.join(
    songsExportPath,
    "pack",
    `select_${packMetadata.id}.png`,
  );
  map.set(sourcePackPath, [targetPackPath]);

  return map;
}

async function copyMappedFiles(fileMap: Map<string, string[]>) {
  console.log("Step 6: Copying files...");
  let copied = 0;

  for (const [sourcePath, targets] of fileMap.entries()) {
    for (const t of targets) {
      const dir = path.dirname(t);

      if (!(await exists(dir))) {
        await fs.mkdir(dir, { recursive: true });
      }

      await fs.copyFile(sourcePath, t).catch((e) => {
        console.error(`Failed to copy ${sourcePath} to ${t}:`, e);
        throw e;
      });
      copied++;
    }
  }
  return copied;
}

export async function exportPack(options: ExportPackOptions) {
  const exportDir = options.mysteryBox ? `export/mystery` : `export/standard`;
  const songsExportPath = path.join(exportDir, "songs");

  const songs = await db.select().from(songsTable);
  const metas = songs.map((s) => s.metadata);

  if (await exists(exportDir)) {
    await fs.rm(exportDir, { recursive: true, force: true });
  }

  await fs.mkdir(exportDir, { recursive: true });
  await validateSongFolders(metas);
  await validateChartFiles(metas);

  console.log("Step 3: Updating metadata...");
  let updated: SongMetadata[];
  let originalMap: Map<SongMetadata, SongMetadata>;

  if (options.mysteryBox) {
    console.log("Mystery Box mode enabled...");
    const metaOrders = songs.reduce(
      (acc, song) => {
        acc[song.metadata.id] = song.mysteryOrder;
        return acc;
      },
      {} as Record<string, number>,
    );

    ({ updated, originalMap } = updateMysteryBoxMetadata(
      metaOrders,
      metas,
      options.packMeta.id,
    ));
  } else {
    ({ updated, originalMap } = updateStandardMetadata(
      metas,
      options.packMeta.id,
      Date.now(),
    ));
  }

  const fileMap = await buildFileMap(
    options.packMeta,
    updated,
    originalMap,
    exportDir,
    songsExportPath,
    options.mysteryBox,
  );

  const copiedFiles = await copyMappedFiles(fileMap);
  const songlistPath = path.join(songsExportPath, "songlist");
  await fs.writeFile(songlistPath, JSON.stringify({ songs: updated }, null, 2));
  const packlistPath = path.join(songsExportPath, "packlist");
  await fs.writeFile(
    packlistPath,
    JSON.stringify({ packs: [options.packMeta] }, null, 2),
  );

  console.log(`Export completed successfully!`);
  console.log(`- Exported ${updated.length} songs`);
  console.log(`- Copied ${copiedFiles} files`);
  console.log(
    `- Mystery box mode: ${options.mysteryBox ? "enabled" : "disabled"}`,
  );
  console.log(`- Export directory: ${exportDir}`);

  return {
    success: true,
    songsExported: updated.length,
    filesCopied: copiedFiles,
    exportPath: exportDir,
    mysteryBox: options.mysteryBox || false,
  };
}
