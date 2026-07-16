"use client";

import { useEffect, useRef } from "react";

/** Renders a span whose text is refreshed every animation frame. */
export default function LiveValue({
  get,
  className,
}: {
  get: () => string;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const g = useRef(get);
  g.current = get;

  useEffect(() => {
    let raf = 0;
    const loop = () => {
      if (ref.current) ref.current.textContent = g.current();
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  return <span ref={ref} className={className} />;
}
