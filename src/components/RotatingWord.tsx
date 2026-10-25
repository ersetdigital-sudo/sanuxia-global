"use client";

import { useEffect, useState } from "react";

export function RotatingWord({ words }: { words: string[] }) {
  const [index, setIndex] = useState(0);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (reduced) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % words.length), 2200);
    return () => clearInterval(t);
  }, [reduced, words.length]);

  return (
    <span
      data-rotating-word
      className="inline-grid overflow-hidden align-bottom h-[.94em] leading-[.94]"
    >
      {words.map((word, i) => (
        <span
          key={word}
          data-active={i === index}
          aria-hidden={i !== index}
          className={`col-start-1 row-start-1 transition-all duration-500 ease-out ${
            i === index ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"
          }`}
        >
          {word}
        </span>
      ))}
      <span className="sr-only">{words[0]}</span>
    </span>
  );
}
