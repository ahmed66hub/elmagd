"use client";

import { useCallback, useEffect, useRef } from "react";

/**
 * يؤجّل تنفيذ الدالة حتى يتوقف المستخدم عن الكتابة.
 * تُستخدم في لوحة التحكم حتى لا نكتب في مصدر البيانات مع كل حرف.
 */
export function useDebouncedCallback<Args extends unknown[]>(
  callback: (...args: Args) => void,
  delay = 400,
): (...args: Args) => void {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latest = useRef(callback);

  useEffect(() => {
    latest.current = callback;
  }, [callback]);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  return useCallback(
    (...args: Args) => {
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => latest.current(...args), delay);
    },
    [delay],
  );
}
