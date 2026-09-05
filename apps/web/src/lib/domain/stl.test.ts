import { describe, expect, it } from "vitest";

import { analyseGeometry, isStlFile, parseStl } from "./stl";

/** يبني ملف STL ثنائيًا من قائمة مثلثات (9 أرقام لكل مثلث). */
function buildBinaryStl(triangles: number[][]): ArrayBuffer {
  const buffer = new ArrayBuffer(84 + triangles.length * 50);
  const view = new DataView(buffer);
  view.setUint32(80, triangles.length, true);

  triangles.forEach((triangle, index) => {
    const offset = 84 + index * 50 + 12;
    triangle.forEach((value, position) => {
      view.setFloat32(offset + position * 4, value, true);
    });
  });

  return buffer;
}

/** مكعب بطول ضلع s يبدأ من نقطة الأصل — 12 مثلثًا. */
function cubeTriangles(size: number): number[][] {
  const s = size;
  const v = [
    [0, 0, 0],
    [s, 0, 0],
    [s, s, 0],
    [0, s, 0],
    [0, 0, s],
    [s, 0, s],
    [s, s, s],
    [0, s, s],
  ];
  const faces = [
    [0, 2, 1],
    [0, 3, 2], // z = 0
    [4, 5, 6],
    [4, 6, 7], // z = s
    [0, 1, 5],
    [0, 5, 4], // y = 0
    [3, 7, 6],
    [3, 6, 2], // y = s
    [0, 4, 7],
    [0, 7, 3], // x = 0
    [1, 2, 6],
    [1, 6, 5], // x = s
  ];
  return faces.map(([a, b, c]) => [...v[a], ...v[b], ...v[c]]);
}

describe("parseStl", () => {
  it("يقرأ ملف STL ثنائيًا", () => {
    const positions = parseStl(buildBinaryStl(cubeTriangles(10)));
    expect(positions.length).toBe(12 * 9);
  });

  it("يقرأ ملف STL نصيًا", () => {
    const ascii = `solid test
facet normal 0 0 1
  outer loop
    vertex 0 0 0
    vertex 10 0 0
    vertex 0 10 0
  endloop
endfacet
endsolid test`;
    const buffer = new TextEncoder().encode(ascii).buffer as ArrayBuffer;
    const positions = parseStl(buffer);
    expect(positions.length).toBe(9);
    expect(positions[3]).toBeCloseTo(10, 5);
  });
});

describe("analyseGeometry", () => {
  it("يحسب حجم مكعب 10 مم كـ 1 سم³", () => {
    const positions = parseStl(buildBinaryStl(cubeTriangles(10)));
    const analysis = analyseGeometry(positions);
    expect(analysis.volumeCm3).toBeCloseTo(1, 5);
    expect(analysis.triangleCount).toBe(12);
  });

  it("يحسب أبعاد الصندوق المحيط", () => {
    const positions = parseStl(buildBinaryStl(cubeTriangles(42)));
    const analysis = analyseGeometry(positions);
    expect(analysis.boundingBoxMm).toEqual([42, 42, 42]);
  });

  it("يتعامل مع ملف فارغ بلا انهيار", () => {
    const analysis = analyseGeometry(new Float32Array(0));
    expect(analysis.triangleCount).toBe(0);
    expect(analysis.volumeCm3).toBe(0);
    expect(analysis.boundingBoxMm).toEqual([0, 0, 0]);
  });
});

describe("isStlFile", () => {
  it("يقبل الامتداد بأي حالة أحرف", () => {
    expect(isStlFile("part.STL")).toBe(true);
    expect(isStlFile("part.stl")).toBe(true);
  });

  it("يرفض الامتدادات الأخرى", () => {
    expect(isStlFile("part.obj")).toBe(false);
    expect(isStlFile("stl")).toBe(false);
  });
});
