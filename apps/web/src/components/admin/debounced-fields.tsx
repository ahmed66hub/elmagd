"use client";

import { useState } from "react";

import { TextArea, TextInput } from "@/components/ui/field";
import { useDebouncedCallback } from "@/lib/hooks/use-debounced-callback";

/**
 * حقول لوحة التحكم تحفظ تلقائيًا بعد توقف الكتابة بلحظة —
 * بلا زر "حفظ"، وبلا كتابة في مصدر البيانات مع كل ضغطة مفتاح.
 */

/**
 * مسوّدة محلية تتبع القيمة القادمة من الخارج.
 * تُضبط أثناء الـ render (النمط الذي توصي به React) بدل useEffect،
 * فلا يحدث render إضافي ولا وميض في الحقل.
 */
function useDraft(external: string) {
  const [draft, setDraft] = useState(external);
  const [lastExternal, setLastExternal] = useState(external);

  if (external !== lastExternal) {
    setLastExternal(external);
    setDraft(external);
  }

  return [draft, setDraft] as const;
}

interface CommonProps {
  label: string;
  value: string;
  onCommit: (value: string) => void;
  placeholder?: string;
  className?: string;
  dir?: "rtl" | "ltr";
}

export function DebouncedText({
  label,
  value,
  onCommit,
  placeholder,
  className,
  dir,
}: CommonProps) {
  const [draft, setDraft] = useDraft(value);
  const commit = useDebouncedCallback(onCommit);

  return (
    <TextInput
      label={label}
      value={draft}
      placeholder={placeholder}
      className={className}
      dir={dir}
      onChange={(event) => {
        setDraft(event.target.value);
        commit(event.target.value);
      }}
    />
  );
}

export function DebouncedArea({
  label,
  value,
  onCommit,
  placeholder,
  className,
}: CommonProps) {
  const [draft, setDraft] = useDraft(value);
  const commit = useDebouncedCallback(onCommit);

  return (
    <TextArea
      label={label}
      value={draft}
      placeholder={placeholder}
      className={className}
      onChange={(event) => {
        setDraft(event.target.value);
        commit(event.target.value);
      }}
    />
  );
}

export function DebouncedNumber({
  label,
  value,
  onCommit,
  step = 1,
  min,
}: {
  label: string;
  value: number;
  onCommit: (value: number) => void;
  step?: number;
  min?: number;
}) {
  const [draft, setDraft] = useDraft(String(value));
  const commit = useDebouncedCallback((raw: string) => {
    const parsed = Number.parseFloat(raw);
    onCommit(Number.isFinite(parsed) ? parsed : 0);
  });

  return (
    <TextInput
      label={label}
      type="number"
      step={step}
      min={min}
      value={draft}
      className="ltr-num text-start"
      onChange={(event) => {
        setDraft(event.target.value);
        commit(event.target.value);
      }}
    />
  );
}
