"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

type ExamResultDialogProps = {
  open: boolean;
  setOpen: (open: boolean) => void;
  content: string;
};

export function QuestionnaireDialog({
  open,
  setOpen,
  content,
}: ExamResultDialogProps) {
  const [text, setText] = useState(content);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>问卷内容</DialogTitle>
          <DialogDescription>请将此段文本复制到腾讯问卷</DialogDescription>
        </DialogHeader>
        <Textarea
          className="max-h-[80vh]"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
      </DialogContent>
    </Dialog>
  );
}
