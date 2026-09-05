import type { BoundingBox, ModelAnalysis } from "@elmagd/types";

/**
 * قراءة ملفات STL وتحليلها — دوال خالصة بلا أي اعتماد على المتصفح أو three.js،
 * حتى يمكن اختبارها وحدها ونقلها لاحقًا إلى الـ backend إن احتجنا تحققًا من جهة السيرفر.
 *
 * الملف لا يُرفع لأي خادم في هذه المرحلة: القراءة والحساب داخل متصفح العميل بالكامل.
 */

const HEADER_BYTES = 80;
const TRIANGLE_BYTES = 50;
const FLOATS_PER_TRIANGLE = 9;

/** مصفوفة مسطّحة من إحداثيات الرؤوس: 9 أرقام لكل مثلث. */
export type TriangleBuffer = Float32Array;

function parseBinaryStl(buffer: ArrayBuffer): TriangleBuffer | null {
  if (buffer.byteLength <= HEADER_BYTES + 4) return null;

  const view = new DataView(buffer);
  const triangleCount = view.getUint32(HEADER_BYTES, true);
  const expectedLength = HEADER_BYTES + 4 + triangleCount * TRIANGLE_BYTES;
  if (expectedLength !== buffer.byteLength) return null;

  const positions = new Float32Array(triangleCount * FLOATS_PER_TRIANGLE);
  for (let i = 0; i < triangleCount; i += 1) {
    // 12 بايت الأولى في كل مثلث هي متجه العمودي ونتجاهلها ونحسبه من الرؤوس.
    const offset = HEADER_BYTES + 4 + i * TRIANGLE_BYTES + 12;
    for (let j = 0; j < FLOATS_PER_TRIANGLE; j += 1) {
      positions[i * FLOATS_PER_TRIANGLE + j] = view.getFloat32(offset + j * 4, true);
    }
  }
  return positions;
}

function parseAsciiStl(buffer: ArrayBuffer): TriangleBuffer {
  const text = new TextDecoder().decode(buffer);
  const vertexPattern = /vertex\s+(-?[\d.eE+-]+)\s+(-?[\d.eE+-]+)\s+(-?[\d.eE+-]+)/g;
  const values: number[] = [];

  let match: RegExpExecArray | null;
  while ((match = vertexPattern.exec(text)) !== null) {
    values.push(Number(match[1]), Number(match[2]), Number(match[3]));
  }

  const usable = Math.floor(values.length / FLOATS_PER_TRIANGLE) * FLOATS_PER_TRIANGLE;
  return new Float32Array(values.slice(0, usable));
}

/** يقرأ STL نصيًا كان أم ثنائيًا ويعيد رؤوس المثلثات. */
export function parseStl(buffer: ArrayBuffer): TriangleBuffer {
  return parseBinaryStl(buffer) ?? parseAsciiStl(buffer);
}

/**
 * حساب الحجم بطريقة signed tetrahedron volume:
 * مجموع أحجام الأهرامات المكوّنة من كل مثلث ونقطة الأصل.
 */
export function analyseGeometry(positions: TriangleBuffer): ModelAnalysis {
  const triangleCount = Math.floor(positions.length / FLOATS_PER_TRIANGLE);

  let signedVolume = 0;
  const min: [number, number, number] = [Infinity, Infinity, Infinity];
  const max: [number, number, number] = [-Infinity, -Infinity, -Infinity];

  for (let i = 0; i < triangleCount; i += 1) {
    const o = i * FLOATS_PER_TRIANGLE;
    const ax = positions[o], ay = positions[o + 1], az = positions[o + 2];
    const bx = positions[o + 3], by = positions[o + 4], bz = positions[o + 5];
    const cx = positions[o + 6], cy = positions[o + 7], cz = positions[o + 8];

    signedVolume +=
      (ax * (by * cz - bz * cy) -
        ay * (bx * cz - bz * cx) +
        az * (bx * cy - by * cx)) /
      6;

    for (let v = 0; v < FLOATS_PER_TRIANGLE; v += 3) {
      for (let axis = 0; axis < 3; axis += 1) {
        const value = positions[o + v + axis];
        if (value < min[axis]) min[axis] = value;
        if (value > max[axis]) max[axis] = value;
      }
    }
  }

  const boundingBoxMm: BoundingBox = triangleCount
    ? [max[0] - min[0], max[1] - min[1], max[2] - min[2]]
    : [0, 0, 0];

  return {
    // الملف بالمليمتر، والحجم بالمليمتر المكعب — نقسم على 1000 للسنتيمتر المكعب.
    volumeCm3: Math.abs(signedVolume) / 1000,
    boundingBoxMm,
    triangleCount,
  };
}

export class InvalidStlError extends Error {
  constructor() {
    super("تعذّر قراءة الملف — تأكد أنه ملف STL صالح.");
    this.name = "InvalidStlError";
  }
}

/** قراءة ملف من المتصفح وتحليله دفعة واحدة. */
export async function readStlFile(
  file: File,
): Promise<{ positions: TriangleBuffer; analysis: ModelAnalysis }> {
  const buffer = await file.arrayBuffer();
  const positions = parseStl(buffer);
  const analysis = analyseGeometry(positions);
  if (!analysis.triangleCount) throw new InvalidStlError();
  return { positions, analysis };
}

export const ACCEPTED_MODEL_EXTENSIONS = [".stl"] as const;

export function isStlFile(fileName: string): boolean {
  return /\.stl$/i.test(fileName);
}
