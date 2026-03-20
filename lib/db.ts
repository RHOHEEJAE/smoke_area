import postgres from "postgres";

const globalForDb = globalThis as typeof globalThis & {
  __dbSql?: ReturnType<typeof postgres>;
};

function requireDatabaseUrl(): string {
  const url = process.env.DATABASE_URL;
  if (!url?.trim()) {
    throw new Error("Missing DATABASE_URL");
  }
  return url.trim();
}

/** Vercel/Supabase pooler(transaction mode) 호환: prepare 비활성화 */
export function getDb() {
  const url = requireDatabaseUrl();
  if (!globalForDb.__dbSql) {
    const local =
      /localhost|127\.0\.0\.1/i.test(url) && !url.includes("supabase");
    globalForDb.__dbSql = postgres(url, {
      prepare: false,
      ssl: local ? false : "require",
      max: 1,
      idle_timeout: 20,
      connect_timeout: 10,
    });
  }
  return globalForDb.__dbSql;
}

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isValidButtId(id: string): boolean {
  return UUID_RE.test(id);
}
