"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ReadButtModal } from "@/components/ReadButtModal";
import { Toast } from "@/components/Toast";
import type { ButtPosition } from "@/lib/types";
import { getBrowserSupabase } from "@/lib/supabase/browser-client";
import type { RealtimePostgresChangesPayload } from "@supabase/supabase-js";

type ButtRow = ButtPosition & { message?: string };

export default function HomePage() {
  const [butts, setButts] = useState<ButtPosition[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/butts");
      const data = (await res.json()) as {
        butts?: ButtPosition[];
        error?: string;
      };
      if (!res.ok) throw new Error(data.error ?? "목록을 불러오지 못했습니다");
      setButts(data.butts ?? []);
      setLoadError(null);
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : "오류");
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    const client = getBrowserSupabase();
    if (!client) return;

    const channel = client
      .channel("butts-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "butts" },
        (payload: RealtimePostgresChangesPayload<ButtRow>) => {
          const row = payload.new as ButtRow | null;
          if (!row?.id) return;
          setButts((prev) => {
            if (prev.some((b) => b.id === row.id)) return prev;
            return [
              ...prev,
              {
                id: row.id,
                pos_x: row.pos_x,
                pos_y: row.pos_y,
                rotation: row.rotation,
              },
            ];
          });
        }
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "butts" },
        (payload: RealtimePostgresChangesPayload<ButtRow>) => {
          const oldRow = payload.old as { id?: string } | null;
          const id = oldRow?.id;
          if (!id) return;
          setButts((prev) => prev.filter((b) => b.id !== id));
        }
      )
      .subscribe();

    return () => {
      client.removeChannel(channel);
    };
  }, []);

  const statusLine = useMemo(() => {
    const n = butts.length;
    if (n === 0) return "골목이 깨끗하네... 아직은.";
    if (n >= 20) return "여기 좀 치워야겠는데";
    return null;
  }, [butts.length]);

  function openModal(id: string) {
    setActiveId(id);
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setActiveId(null);
  }

  return (
    <main className="relative min-h-dvh w-full overflow-hidden">
      <div
        className="alley-noise absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: "url(/alley.jpg)",
        }}
      />
      <div
        className="absolute inset-0"
        style={{ backgroundColor: "var(--alley-overlay)" }}
      />

      <div className="relative z-10 min-h-dvh">
        {loadError && (
          <div className="mx-auto max-w-lg px-4 pt-6 text-center text-sm text-red-300/90">
            {loadError}
          </div>
        )}

        {statusLine && (
          <p className="pointer-events-none absolute left-0 right-0 top-6 z-20 px-4 text-center text-sm tracking-wide text-alley-cream/80 drop-shadow md:top-8">
            {statusLine}
          </p>
        )}

        <div className="relative mx-auto h-dvh max-w-6xl">
          {butts.map((b) => (
            <button
              key={b.id}
              type="button"
              onClick={() => openModal(b.id)}
              className="group absolute flex min-h-[44px] min-w-[44px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FFD700]/70"
              style={{
                left: `${b.pos_x}%`,
                top: `${b.pos_y}%`,
                transform: `translate(-50%, -50%) rotate(${b.rotation}deg)`,
              }}
              aria-label="꽁초 읽기"
            >
              <span
                className="select-none text-2xl leading-none opacity-75 transition duration-200 group-hover:scale-[1.3] group-hover:opacity-100"
                style={{
                  filter: "none",
                }}
              >
                <span className="transition duration-200 group-hover:drop-shadow-[0_0_6px_#FFD700]">
                  🚬
                </span>
              </span>
            </button>
          ))}
        </div>

        <div className="fixed bottom-0 left-0 right-0 z-30 flex flex-col gap-2 border-t border-white/5 bg-[rgba(10,8,5,0.72)] p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] backdrop-blur-sm sm:flex-row sm:justify-end sm:gap-3 sm:border-0 sm:bg-transparent sm:p-6 sm:backdrop-blur-none">
          <Link
            href="/write"
            className="inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-lg bg-alley-brown px-4 py-3 text-center text-sm font-medium text-[#0a0805] shadow transition hover:bg-alley-brownHover sm:min-w-[160px] sm:py-3"
          >
            <span aria-hidden>🚬</span>
            담배피기
          </Link>
          <button
            type="button"
            className="inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-lg border border-alley-brown/50 bg-[rgba(10,8,5,0.55)] px-4 py-3 text-sm text-alley-cream/90 transition hover:border-alley-brownHover hover:bg-[rgba(10,8,5,0.72)] sm:min-w-[160px]"
          >
            <span aria-hidden>🚶</span>
            그냥 지나치기
          </button>
        </div>
      </div>

      <ReadButtModal
        buttId={activeId}
        open={modalOpen}
        onClose={closeModal}
        onPickedUp={(id) =>
          setButts((prev) => prev.filter((b) => b.id !== id))
        }
        onToast={setToast}
      />
      <Toast message={toast} onDismiss={() => setToast(null)} />
    </main>
  );
}
