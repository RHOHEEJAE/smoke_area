"use client";

import { useEffect } from "react";

type Props = {
  message: string | null;
  onDismiss: () => void;
};

export function Toast({ message, onDismiss }: Props) {
  useEffect(() => {
    if (!message) return;
    const t = window.setTimeout(onDismiss, 2800);
    return () => window.clearTimeout(t);
  }, [message, onDismiss]);

  if (!message) return null;

  return (
    <div
      role="status"
      className="pointer-events-none fixed bottom-28 left-1/2 z-[60] -translate-x-1/2 rounded-lg border border-alley-brown/60 bg-[rgba(10,8,5,0.92)] px-4 py-3 text-center text-sm text-alley-cream shadow-lg backdrop-blur-sm motion-safe:animate-[toastFade_0.35s_ease-out] md:bottom-8"
    >
      {message}
    </div>
  );
}
