/**
 * تصغير الصور داخل المتصفح قبل حفظها أو رفعها.
 *
 * بلا backend: تُحفظ الصورة كـ data URL في التخزين المحلي.
 * مع Supabase: يُرفع الـ Blob المصغَّر إلى Storage ويُحفظ رابطه فقط.
 */

async function loadImage(file: File): Promise<{ image: HTMLImageElement; revoke: () => void }> {
  const objectUrl = URL.createObjectURL(file);
  const revoke = () => URL.revokeObjectURL(objectUrl);

  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const element = new Image();
    element.onload = () => resolve(element);
    element.onerror = () => {
      revoke();
      reject(new Error("تعذّر قراءة الصورة"));
    };
    element.src = objectUrl;
  });

  return { image, revoke };
}

function drawScaled(image: HTMLImageElement, maxWidth: number): HTMLCanvasElement {
  const scale = Math.min(1, maxWidth / image.width);
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(image.width * scale);
  canvas.height = Math.round(image.height * scale);

  const context = canvas.getContext("2d");
  if (!context) throw new Error("تعذّر معالجة الصورة");
  context.drawImage(image, 0, 0, canvas.width, canvas.height);

  return canvas;
}

export async function readImageAsDataUrl(
  file: File,
  maxWidth: number,
  quality = 0.74,
): Promise<string> {
  const { image, revoke } = await loadImage(file);
  try {
    return drawScaled(image, maxWidth).toDataURL("image/jpeg", quality);
  } finally {
    revoke();
  }
}

export async function resizeImageToFile(
  file: File,
  maxWidth: number,
  quality = 0.82,
): Promise<File> {
  const { image, revoke } = await loadImage(file);
  try {
    const canvas = drawScaled(image, maxWidth);

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", quality),
    );
    if (!blob) throw new Error("تعذّر معالجة الصورة");

    const name = file.name.replace(/\.[^.]+$/, "") + ".jpg";
    return new File([blob], name, { type: "image/jpeg" });
  } finally {
    revoke();
  }
}
