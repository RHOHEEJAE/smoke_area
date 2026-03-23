"use client";

import { useCallback, useEffect, useState } from "react";

type CommentItem = {
  id: string;
  author: string;
  content: string;
  created_at: string;
};

type Props = {
  buttId: string | null;
  open: boolean;
  onClose: () => void;
  onPickedUp: (id: string) => void;
  onToast: (msg: string) => void;
  onChanged: () => void;
};

export function ReadButtModal({
  buttId,
  open,
  onClose,
  onPickedUp,
  onToast,
  onChanged,
}: Props) {
  const [message, setMessage] = useState<string | null>(null);
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [warmUntil, setWarmUntil] = useState<string | null>(null);
  const [author, setAuthor] = useState("");
  const [password, setPassword] = useState("");
  const [content, setContent] = useState("");
  const [posting, setPosting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nowTick, setNowTick] = useState(Date.now());

  const reset = useCallback(() => {
    setMessage(null);
    setLoading(false);
    setDeleting(false);
    setPosting(false);
    setError(null);
    setComments([]);
    setWarmUntil(null);
    setAuthor("");
    setPassword("");
    setContent("");
    setNowTick(Date.now());
  }, []);

  useEffect(() => {
    if (!open) return;
    const id = window.setInterval(() => setNowTick(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [open]);

  const warmLeftMs = warmUntil
    ? Math.max(0, new Date(warmUntil).getTime() - nowTick)
    : 0;
  const canPickUp = warmLeftMs <= 0;

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
        const data = (await res.json()) as {
          message?: string;
          warm_until?: string | null;
          comments?: CommentItem[];
          error?: string;
        };
        if (!res.ok) throw new Error(data.error ?? "불러오기 실패");
        return data;
      })
      .then((data) => {
        if (cancelled) return;
        setMessage(data.message ?? "");
        setWarmUntil(data.warm_until ?? null);
        setComments(Array.isArray(data.comments) ? data.comments : []);
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
    if (!buttId || deleting || !canPickUp) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/butts/${buttId}`, { method: "DELETE" });
      const data = (await res.json()) as { success?: boolean; error?: string };
      if (!res.ok) throw new Error(data.error ?? "삭제 실패");
      onPickedUp(buttId);
      onToast("꽁초를 주웠습니다");
      onChanged();
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "오류");
    } finally {
      setDeleting(false);
    }
  }

  async function handleAddComment() {
    if (!buttId || posting) return;
    setPosting(true);
    setError(null);
    try {
      const res = await fetch(`/api/butts/${buttId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ author, password, content }),
      });
      const data = (await res.json()) as {
        comment?: CommentItem;
        error?: string;
      };
      if (!res.ok) throw new Error(data.error ?? "댓글 등록 실패");
      if (data.comment) setComments((prev) => [...prev, data.comment!]);
      setWarmUntil(new Date(Date.now() + 60 * 60 * 1000).toISOString());
      setContent("");
      onChanged();
      onToast("댓글이 등록됐습니다");
    } catch (e) {
      setError(e instanceof Error ? e.message : "오류");
    } finally {
      setPosting(false);
    }
  }

  async function handleDeleteComment(commentId: string) {
    if (!buttId) return;
    const pw = window.prompt("댓글 삭제 비밀번호를 입력하세요");
    if (!pw) return;
    try {
      const res = await fetch(`/api/butts/${buttId}/comments`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ commentId, password: pw }),
      });
      const data = (await res.json()) as { success?: boolean; error?: string };
      if (!res.ok) throw new Error(data.error ?? "댓글 삭제 실패");
      setComments((prev) => prev.filter((c) => c.id !== commentId));
      onChanged();
      onToast("댓글을 삭제했습니다");
    } catch (e) {
      setError(e instanceof Error ? e.message : "오류");
    }
  }

  const warmText =
    warmLeftMs > 0
      ? `온기가 남아 있어 ${Math.ceil(warmLeftMs / 60000)}분 후 주울 수 있어요`
      : "온기가 식었습니다. 꽁초를 주울 수 있어요.";

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
        <div className="mt-3 rounded-md border border-[#ffb86b]/35 bg-[#3b2c1d]/45 px-3 py-2 text-xs text-[#ffd9a6]">
          {warmText}
        </div>

        <div className="mt-4 space-y-2 rounded-lg border border-white/10 bg-black/15 p-3">
          <p className="text-xs tracking-wide text-alley-cream/70">댓글</p>
          <div className="max-h-36 space-y-2 overflow-auto pr-1">
            {comments.length === 0 && (
              <p className="text-xs text-alley-cream/45">아직 댓글이 없습니다.</p>
            )}
            {comments.map((c) => (
              <div key={c.id} className="rounded-md border border-white/10 bg-black/20 p-2">
                <div className="flex items-center justify-between text-[11px] text-alley-cream/65">
                  <span>{c.author}</span>
                  <button
                    type="button"
                    onClick={() => handleDeleteComment(c.id)}
                    className="rounded px-2 py-0.5 text-[10px] text-red-200/90 hover:bg-red-950/35"
                  >
                    삭제
                  </button>
                </div>
                <p className="mt-1 whitespace-pre-wrap text-sm text-alley-cream/90">{c.content}</p>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-2">
            <input
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="아이디"
              maxLength={30}
              className="h-9 rounded-md border border-white/15 bg-black/30 px-2 text-xs outline-none focus:border-alley-brownHover"
            />
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="비밀번호(4~40자)"
              type="password"
              maxLength={40}
              className="h-9 rounded-md border border-white/15 bg-black/30 px-2 text-xs outline-none focus:border-alley-brownHover"
            />
          </div>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value.slice(0, 200))}
            placeholder="댓글 남기기 (최대 200자)"
            rows={3}
            className="w-full resize-none rounded-md border border-white/15 bg-black/30 p-2 text-xs outline-none focus:border-alley-brownHover"
          />
          <button
            type="button"
            onClick={handleAddComment}
            disabled={posting}
            className="w-full rounded-md border border-white/15 bg-black/25 px-3 py-2 text-xs text-alley-cream transition enabled:hover:bg-black/35 disabled:opacity-50"
          >
            {posting ? "댓글 등록 중…" : "댓글 달기"}
          </button>
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
            disabled={loading || !!error || deleting || !canPickUp}
            className="order-1 rounded-lg bg-alley-brown px-4 py-3 text-sm font-medium text-[#0a0805] shadow-md transition enabled:hover:bg-alley-brownHover disabled:cursor-not-allowed disabled:opacity-50 sm:order-2 sm:py-2.5"
          >
            {deleting ? "줍는 중…" : canPickUp ? "꽁초 줍기" : "온기가 남아 있음"}
          </button>
        </div>
      </div>
    </div>
  );
}
