"use client";

import { useMemo, useState } from "react";
import type { Work } from "@elmagd/types";

import { WorkCard } from "@/components/site/work-card";
import { FilterChip } from "@/components/ui/chip";

const ALL = "__all__";

/** المعرض مع فلترة بالفئة — الفئات تُشتق من الأعمال نفسها. */
export function WorkGallery({ works }: { works: Work[] }) {
  const [category, setCategory] = useState<string>(ALL);

  const categories = useMemo(() => {
    const unique = new Set<string>();
    works.forEach((work) => {
      if (work.category) unique.add(work.category);
    });
    return [...unique];
  }, [works]);

  const visible = useMemo(
    () => (category === ALL ? works : works.filter((work) => work.category === category)),
    [category, works],
  );

  return (
    <>
      <div className="mb-5 flex flex-wrap gap-1.5">
        <FilterChip active={category === ALL} onClick={() => setCategory(ALL)}>
          الكل
        </FilterChip>
        {categories.map((entry) => (
          <FilterChip
            key={entry}
            active={category === entry}
            onClick={() => setCategory(entry)}
          >
            {entry}
          </FilterChip>
        ))}
      </div>

      {visible.length ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((work) => (
            <WorkCard key={work.id} work={work} />
          ))}
        </div>
      ) : (
        <div className="rounded-card border border-dashed border-edge-2 p-10 text-center text-soft">
          لا توجد أعمال في هذه الفئة بعد.
        </div>
      )}
    </>
  );
}
