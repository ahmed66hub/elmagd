import { describe, expect, it } from "vitest";

import { buildWhatsappLink, normalizeWhatsappNumber } from "./whatsapp";

describe("normalizeWhatsappNumber", () => {
  it("يحوّل الرقم المحلي المصري إلى الصيغة الدولية", () => {
    expect(normalizeWhatsappNumber("01001234567")).toBe("201001234567");
  });

  it("يترك الرقم الدولي كما هو", () => {
    expect(normalizeWhatsappNumber("201001234567")).toBe("201001234567");
  });

  it("يتجاهل المسافات والرموز", () => {
    expect(normalizeWhatsappNumber("+20 (100) 123-4567")).toBe("201001234567");
  });

  it("يعالج البادئة 00", () => {
    expect(normalizeWhatsappNumber("0020 100 1234567")).toBe("201001234567");
  });

  it("يعيد نصًا فارغًا لمدخل بلا أرقام", () => {
    expect(normalizeWhatsappNumber("غير معروف")).toBe("");
  });
});

describe("buildWhatsappLink", () => {
  it("يبني رابط wa.me مع رسالة مرمّزة", () => {
    const link = buildWhatsappLink("01001234567", "مرحبا");
    expect(link.startsWith("https://wa.me/201001234567?text=")).toBe(true);
    expect(decodeURIComponent(link.split("text=")[1])).toBe("مرحبا");
  });

  it("يبني الرابط بلا نص عندما تكون الرسالة فارغة", () => {
    expect(buildWhatsappLink("01001234567", "  ")).toBe("https://wa.me/201001234567");
  });
});
