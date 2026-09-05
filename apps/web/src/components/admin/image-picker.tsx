/* eslint-disable @next/next/no-img-element */
"use client";

import { useRef } from "react";

import { useToast } from "@/components/providers";
import { Button } from "@/components/ui/button";
import { storeImage, type MediaFolder } from "@/lib/data/media";

export function ImagePicker({
  label,
  value,
  maxWidth = 760,
  folder = "works",
  emptyLabel = "بدون صورة",
  onChange,
}: {
  label: string;
  value: string;
  maxWidth?: number;
  /** مجلد التخزين على الـ backend عند تفعيله. */
  folder?: MediaFolder;
  emptyLabel?: string;
  onChange: (url: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const { notify } = useToast();

  async function handleFile(file: File) {
    try {
      onChange(await storeImage(file, folder, maxWidth));
      notify("تم تحديث الصورة");
    } catch (error) {
      notify(error instanceof Error ? error.message : "تعذّر رفع الصورة");
    }
  }

  return (
    <div className="mb-3.5">
      <span className="mb-1.5 block text-[13.5px] text-soft">{label}</span>
      <div className="flex flex-wrap items-center gap-3">
        {value ? (
          <img
            src={value}
            alt=""
            className="h-14 w-[70px] rounded-[5px] border border-edge object-cover"
          />
        ) : (
          <span className="grid h-14 w-[70px] place-items-center rounded-[5px] border border-edge bg-sunk text-[10px] text-soft">
            {emptyLabel}
          </span>
        )}

        <Button variant="outline" size="sm" onClick={() => inputRef.current?.click()}>
          اختر صورة
        </Button>
        {value ? (
          <Button variant="danger" size="sm" onClick={() => onChange("")}>
            حذف
          </Button>
        ) : null}

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          hidden
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) void handleFile(file);
            event.target.value = "";
          }}
        />
      </div>
    </div>
  );
}
