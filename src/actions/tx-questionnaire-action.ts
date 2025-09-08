"use server";

import { eq } from "drizzle-orm";
import { db } from "@/db";
import { songerTable } from "@/db/schemas/songer-table";
import { songsTable } from "@/db/schemas/songs-table";
import { usersTable } from "@/db/schemas/users-table";
import { getLocale } from "@/lib/arcaea/langs-schema";
import type { RatingClass } from "@/lib/arcaea/song-schema";
import { shuffle } from "@/lib/shuffle";

type Option = {
  id: number;
  label: string;
};

const classMap: Record<RatingClass, string> = {
  0: "PST",
  1: "PRS",
  2: "FTR",
  3: "BYD",
  4: "ETR",
};

type Question = {
  title: string;
  description: string;
  type: "单选题" | "多选题";
  scores: number[];
  options: Option[];
  scoring: "全部" | "部分";
  answers: string[];
};

function printQuestions(questions: Question[]): string {
  let result = "";
  for (const q of questions) {
    result += `${q.title}[${q.type}][必答][答案：${q.answers.join("、")}][分数：${q.scores.join("、")}][${q.scoring}](${q.description})\n`;

    for (const option of q.options) {
      result += `${option.label}\n`;
    }

    result += "\n";
  }
  return result;
}

export async function txQuestionnaire() {
  const [songs, users, songers] = await Promise.all([
    db.select().from(songsTable).where(eq(songsTable.isBonus, false)),
    db.select().from(usersTable),
    db.select().from(songerTable),
  ]);

  const questions: Question[] = [];

  const jammers = users.filter((u) => u.isJammer);

  songs.sort((a, b) => {
    if (a.metadata.id < b.metadata.id) {
      return -1;
    }
    if (a.metadata.id > b.metadata.id) {
      return 1;
    }
    return 0;
  });

  for (const song of songs) {
    const assignedUser = songers
      .filter((s) => s.songId === song.id)
      .map((s) => {
        const user = users.find((u) => u.id === s.userId);
        if (!user) {
          throw new Error(`未找到用户ID: ${s.userId}`);
        }
        return {
          ...user,
          role: s.role,
        };
      });

    if (assignedUser.length === 0) {
      continue;
    }

    const options = assignedUser
      .filter((user) => !user.isJammer)
      .map((user) => ({
        id: user.id,
        label: `[${user.name}](https://space.bilibili.com/${user.bilibili})`,
      }));

    shuffle(options);

    for (const jammer of jammers) {
      options.push({
        id: jammer.id,
        label: `干扰 ~ [${jammer.name}](https://space.bilibili.com/${jammer.bilibili})`,
      });
    }

    const answers = assignedUser
      .filter((u) => u.role === "real")
      .map((u) => {
        const optionIndex = options.findIndex((o) => o.id === u.id);
        return String.fromCharCode(65 + optionIndex); // A, B, C, D...
      });

    const { metadata } = song;

    const designers = metadata.difficulties
      .filter((d) => d.rating > 0)
      .map((d) => {
        return `${classMap[d.ratingClass]}${d.rating}${d.ratingPlus ? "+" : ""}: ${d.chartDesigner}`;
      })
      .join("\n");

    const question: Question = {
      title: `${getLocale(metadata.title_localized)} - ${getLocale(metadata.artist_localized) ?? metadata.artist}`,
      description: `**ID: ${metadata.id}**\n${designers}`,
      type: answers.length > 1 ? "多选题" : "单选题",
      scoring: answers.length > 1 ? "部分" : "全部",
      options: options,
      scores: new Array(answers.length).fill(1),
      answers: answers,
    };

    questions.push(question);
  }

  return printQuestions(questions);
}
