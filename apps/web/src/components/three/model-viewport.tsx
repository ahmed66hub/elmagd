"use client";

import dynamic from "next/dynamic";
import { useRef, useState, type DragEvent } from "react";
import type { BoundingBox } from "@elmagd/types";

import { Button } from "@/components/ui/button";
import { BoundsIcon, CubeIcon, FitIcon, RotateIcon } from "@/components/ui/icons";
import { cn } from "@/lib/utils/cn";

const ModelScene = dynamic(() => import("@/components/three/model-scene"), {
  ssr: false,
  loading: () => (
    <div className="grid size-full place-items-center bg-sunk text-[12px] text-soft">
      جارِ تحميل المعاين…
    </div>
  ),
});

interface ModelViewportProps {
  positions: Float32Array | null;
  boundingBox: BoundingBox;
  fileName: string | null;
  filamentColor: string;
  brandColor: string;
  isDark: boolean;
  onFileSelected: (file: File) => void;
}

interface ToolButtonProps {
  label: string;
  active?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}

function ToolButton({ label, active, onClick, children }: ToolButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-label={label}
      aria-pressed={active}
      className={cn(
        "grid size-8 place-items-center rounded-[5px] border border-edge bg-card text-soft transition-colors duration-150 hover:border-brand hover:text-brand",
        active && "border-brand text-brand",
      )}
    >
      {children}
    </button>
  );
}

/**
 * إطار المعاين: رفع الملف بالسحب أو بالزر، وأدوات العرض.
 * الملف لا يغادر المتصفح — القراءة والحساب محليًا بالكامل.
 */
export function ModelViewport({
  positions,
  boundingBox,
  fileName,
  filamentColor,
  brandColor,
  isDark,
  onFileSelected,
}: ModelViewportProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setDragging] = useState(false);
  const [autoRotate, setAutoRotate] = useState(true);
  const [wireframe, setWireframe] = useState(false);
  const [showBounds, setShowBounds] = useState(true);
  const [resetToken, setResetToken] = useState(0);

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragging(false);
    const file = event.dataTransfer.files?.[0];
    if (file) onFileSelected(file);
  }

  const dimensions = boundingBox.map((value) => Math.round(value)).join("×");

  return (
    <div>
      <div
        className="relative aspect-16/10 overflow-hidden rounded-card border border-edge bg-card"
        onDragEnter={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragOver={(event) => event.preventDefault()}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
      >
        <ModelScene
          positions={positions}
          color={filamentColor}
          brandColor={brandColor}
          isDark={isDark}
          wireframe={wireframe}
          showBounds={showBounds}
          autoRotate={autoRotate}
          resetToken={resetToken}
        />

        <div className="absolute top-2.5 start-2.5 z-3">
          <Button size="sm" onClick={() => inputRef.current?.click()}>
            ارفع ملف STL
          </Button>
          <input
            ref={inputRef}
            type="file"
            accept=".stl"
            hidden
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) onFileSelected(file);
              event.target.value = "";
            }}
          />
        </div>

        <div className="absolute top-2.5 end-2.5 z-3 flex gap-1.5">
          <ToolButton
            label="تدوير تلقائي"
            active={autoRotate}
            onClick={() => setAutoRotate((value) => !value)}
          >
            <RotateIcon className="size-4" />
          </ToolButton>
          <ToolButton
            label="عرض شبكي"
            active={wireframe}
            onClick={() => setWireframe((value) => !value)}
          >
            <CubeIcon className="size-4" />
          </ToolButton>
          <ToolButton
            label="إطار الأبعاد"
            active={showBounds}
            onClick={() => setShowBounds((value) => !value)}
          >
            <BoundsIcon className="size-4" />
          </ToolButton>
          <ToolButton label="إعادة الضبط" onClick={() => setResetToken((n) => n + 1)}>
            <FitIcon className="size-4" />
          </ToolButton>
        </div>

        {/* مواضع فيزيائية صريحة: الشارة تستخدم direction:ltr فلا تصلح معها start/end. */}
        <span className="ltr-num absolute bottom-2.5 left-3 z-3 rounded border border-edge bg-card px-2 py-0.5 text-[10.5px] text-soft">
          {fileName ? "YOUR FILE" : "SAMPLE"} · {dimensions} mm
        </span>

        <span className="absolute right-3 bottom-2.5 z-3 hidden text-[11.5px] text-soft sm:block">
          اسحب للتدوير · عجلة الماوس للتقريب
        </span>

        {isDragging ? (
          <div className="absolute inset-0 z-4 grid place-items-center rounded-card border-2 border-dashed border-brand bg-brand-soft font-display font-bold text-brand">
            أفلت ملف STL هنا
          </div>
        ) : null}
      </div>

      <p className="mt-2.5 text-[11.5px] text-soft">
        الملف لا يُرفع لأي سيرفر — القراءة والحساب داخل متصفحك بالكامل.
      </p>
    </div>
  );
}
