"use client";

type Props = {
  active: boolean;
};

export function SmokeParticles({ active }: Props) {
  if (!active) return null;

  const particles = Array.from({ length: 28 }, (_, i) => ({
    id: i,
          left: `${8 + ((i * 17) % 84)}%`,
          delay: `${(i % 7) * 0.08}s`,
          duration: `${1.8 + (i % 5) * 0.15}s`,
          size: `${10 + (i % 6) * 4}px`,
  }));

  return (
    <div
      className="pointer-events-none fixed inset-0 z-[100] overflow-hidden"
      aria-hidden
    >
      {particles.map((p) => (
        <span
          key={p.id}
          className="absolute bottom-0 block rounded-full bg-gradient-to-t from-white/25 to-transparent blur-sm motion-reduce:opacity-0"
          style={{
            left: p.left,
            width: p.size,
            height: p.size,
            animation: `smoke-rise ${p.duration} ease-out ${p.delay} forwards`,
          }}
        />
      ))}
    </div>
  );
}
