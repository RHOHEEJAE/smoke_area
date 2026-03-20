"use client";

import { useCallback, useEffect, useState } from "react";

type Props = {
  buttId: string | null;
  open: boolean;
  onClose: () => void;
  onPickedUp: (id: string) => void;
  onToast: (msg: string) => void;
};

export function ReadButtModal({
  buttId,
  open,
  onClose,
  onPickedUp,
  onToast,
}: Props) {
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reset = useCallback(() => {
    setMessage(null);
    setLoading(false);
    setDeleting(false);
    setError(null);
  }, []);

  useEffect(() => {
    if (!open || !buttId) {
      reset();
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);
    setMessage(null);

    fetch(`/api/butts/${buttId}`)
      .then(async (res) => {
        const data = (await res.json()) as { message?: string; error?: string };
        if (!res.ok) throw new Error(data.error ?? "불러오기 실패");
        return data.message ?? "";
      })
      .then((msg) => {
        if (!cancelled) setMessage(msg);
      })
      .catch((e: Error) => {
        if (!cancelled) setError(e.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [open, buttId, reset]);

  if (!open || !buttId) return null;

  async function handlePickUp() {
    if (!buttId || deleting) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/butts/${buttId}`, { method: "DELETE" });
      const data = (await res.json()) as { success?: boolean; error?: string };
      if (!res.ok) throw new Error(data.error ?? "삭제 실패");
      onPickedUp(buttId);
      onToast("꽁초를 주웠습니다");
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "오류");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center p-4 pb-[env(safe-area-inset-bottom)] sm:items-center sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="butt-modal-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/55 backdrop-blur-[4px]"
        aria-label="닫기"
        onClick={onClose}
      />
      <div
        className="relative z-10 w-full max-w-md animate-modal-up rounded-tl-2xl rounded-tr-lg rounded-br-3xl rounded-bl-md border border-alley-brown/40 bg-[#1e1a16] p-6 text-alley-cream shadow-[0_18px_50px_rgba(0,0,0,0.55),inset_0_1px_0_rgba(255,255,255,0.06)]"
        style={{ borderRadius: "22px 14px 28px 18px" }}
      >
        <h2 id="butt-modal-title" className="mb-3 text-xs tracking-widest text-alley-brownHover/90">
          꽁초에 적힌 말
        </h2>
        <div className="min-h-[4.5rem] whitespace-pre-wrap text-[15px] leading-relaxed text-alley-cream/95">
          {loading && <p className="text-alley-cream/50">읽는 중…</p>}
          {!loading && error && (
            <p className="text-red-300/90">{error}</p>
          )}
          {!loading && !error && message !== null && (
            <p>{message || "(말이 없다.)"}</p>
          )}
        </div>
        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="order-2 rounded-lg border border-white/10 bg-transparent px-4 py-3 text-sm text-alley-cream/85 transition hover:bg-white/5 sm:order-1 sm:py-2.5"
          >
            그냥 놔두기
          </button>
          <button
            type="button"
            onClick={handlePickUp}
            disabled={loading || !!error || deleting}
            className="order-1 rounded-lg bg-alley-brown px-4 py-3 text-sm font-medium text-[#0a0805] shadow-md transition enabled:hover:bg-alley-brownHover disabled:cursor-not-allowed disabled:opacity-50 sm:order-2 sm:py-2.5"
          >
            {deleting ? "줍는 중…" : "꽁초 줍기"}
          </button>
        </div>
      </div>
    </div>
  );
}
