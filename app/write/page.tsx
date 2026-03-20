"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { SmokeParticles } from "@/components/SmokeParticles";

const MAX = 200;

export default function WritePage() {
  const router = useRouter();
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [smoke, setSmoke] = useState(false);

  const len = text.length;

  const discard = useCallback(() => {
    router.push("/");
  }, [router]);

  async function submit() {
    const message = text.trim();
    if (!message || submitting) return;
    setSubmitting(true);
    setError(null);
    setSmoke(true);

    const pos_x = Math.random() * 80 + 10;
    const pos_y = Math.random() * 70 + 15;
    const rotation = Math.random() * 90 - 45;

    try {
      const res = await fetch("/api/butts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, pos_x, pos_y, rotation }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(data.error ?? "저장 실패");

      await new Promise((r) => setTimeout(r, 550));
      router.push("/");
    } catch (e) {
      setSmoke(false);
      setError(e instanceof Error ? e.message : "오류");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="relative min-h-dvh w-full overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url(/alley.jpg)" }}
      />
      <div
        className="absolute inset-0"
        style={{ backgroundColor: "var(--alley-overlay)" }}
      />

      <div className="relative z-10 mx-auto flex min-h-dvh max-w-lg flex-col px-4 pb-32 pt-10 sm:px-6 sm:pb-28 sm:pt-16">
        <h1 className="mb-6 text-center text-lg tracking-wide text-alley-cream/90">
          남기고 갈 말
        </h1>

        <div className="relative flex-1">
          <label htmlFor="msg" className="sr-only">
            메시지
          </label>
          <textarea
            id="msg"
            maxLength={MAX}
            value={text}
            onChange={(e) => setText(e.target.value.slice(0, MAX))}
            placeholder="여기 두고 가도 아무도 모를 말..."
            rows={10}
            className="lined-paper h-full min-h-[240px] w-full resize-none rounded-xl border border-alley-brown/35 p-4 pr-5 text-[15px] leading-6 text-alley-cream placeholder:text-alley-cream/35 focus:border-alley-brownHover focus:outline-none focus:ring-1 focus:ring-alley-brownHover/60"
          />
          <div className="mt-2 text-right text-xs text-alley-cream/45">
            {len} / {MAX}
          </div>
        </div>

        {error && (
          <p className="mt-2 text-center text-sm text-red-300/90">{error}</p>
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-30 flex flex-col gap-2 border-t border-white/5 bg-[rgba(10,8,5,0.75)] p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] backdrop-blur-sm sm:flex-row sm:justify-center sm:gap-4 sm:border-0 sm:bg-transparent sm:p-8 sm:backdrop-blur-none">
        <button
          type="button"
          onClick={submit}
          disabled={submitting || !text.trim()}
          className="inline-flex min-h-[44px] flex-1 items-center justify-center rounded-lg bg-alley-brown px-4 py-3 text-sm font-medium text-[#0a0805] shadow transition enabled:hover:bg-alley-brownHover disabled:cursor-not-allowed disabled:opacity-45 sm:max-w-xs"
        >
          {submitting ? "버리는 중…" : "꽁초 버리기"}
        </button>
        <button
          type="button"
          onClick={discard}
          className="inline-flex min-h-[44px] flex-1 items-center justify-center rounded-lg border border-alley-brown/55 bg-[rgba(10,8,5,0.55)] px-4 py-3 text-sm text-alley-cream/90 transition hover:border-alley-brownHover sm:max-w-xs"
        >
          그냥 삼키기
        </button>
      </div>

      <Link
        href="/"
        className="fixed left-4 top-4 z-40 rounded-md border border-white/10 bg-[rgba(10,8,5,0.6)] px-3 py-2 text-xs text-alley-cream/80 backdrop-blur-sm transition hover:border-alley-brown/40 hover:text-alley-cream"
      >
        ← 골목으로
      </Link>

      <SmokeParticles active={smoke} />
    </main>
  );
}
