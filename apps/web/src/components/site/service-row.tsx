import type { Service } from "@elmagd/types";

import { formatIndex } from "@/lib/utils/format";

/** صف خدمة واحد داخل قائمة الخدمات. */
export function ServiceRow({ service, index }: { service: Service; index: number }) {
  return (
    <div className="grid grid-cols-[34px_1fr] items-center gap-4 border-b border-edge px-4 py-5 transition-colors duration-200 last:border-b-0 hover:bg-card-2 sm:grid-cols-[46px_1fr_auto] sm:gap-4.5">
      <div className="ltr-num text-xs text-brand">{formatIndex(index)}</div>
      <div>
        <h3 className="mb-1 text-[17.5px]">{service.title}</h3>
        <p className="max-w-[64ch] text-sm text-soft">{service.description}</p>
      </div>
      <div className="ltr-num col-start-2 text-[13px] whitespace-nowrap text-body sm:col-start-3">
        {service.price}
      </div>
    </div>
  );
}
