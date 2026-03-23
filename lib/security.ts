import { createHash } from "crypto";

export function hashPassword(raw: string): string {
  return createHash("sha256").update(raw).digest("hex");
}
