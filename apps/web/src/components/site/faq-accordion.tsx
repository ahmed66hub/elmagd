"use client";

import { useState } from "react";
import type { FaqItem } from "@elmagd/types";

import { cn } from "@/lib/utils/cn";

export function FaqAccordion({ items }: { items: FaqItem[] }) {
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <div className="max-w-[900px] overflow-hidden rounded-card border border-edge bg-card">
      {items.map((item) => {
        const isOpen = openId === item.id;
        return (
          <div key={item.id} className="border-b border-edge last:border-b-0">
            <h3>
              <button
                type="button"
                onClick={() => setOpenId(isOpen ? null : item.id)}
                aria-expanded={isOpen}
                aria-controls={`faq-${item.id}`}
                className="flex w-full items-center justify-between gap-3.5 px-5 py-4.5 text-start font-display text-[15.5px] font-semibold text-ink transition-colors duration-150 hover:bg-card-2"
              >
                {item.question}
                <span className="relative size-4.5 shrink-0" aria-hidden="true">
                  <span className="absolute inset-x-0 top-2 h-0.5 rounded-sm bg-brand" />
                  <span
                    className={cn(
                      "absolute inset-y-0 start-2 w-0.5 rounded-sm bg-brand transition-all duration-300",
                      isOpen && "rotate-90 opacity-0",
                    )}
                  />
                </span>
              </button>
            </h3>
            <div
              id={`faq-${item.id}`}
              hidden={!isOpen}
              className="bg-card-2 px-5 pb-4.5 text-[14.5px] text-soft"
            >
              <p className="pt-1">{item.answer}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
