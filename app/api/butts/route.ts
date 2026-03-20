import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET() {
  try {
    const sql = getDb();
    const rows = await sql<{
      id: string;
      pos_x: string | number;
      pos_y: string | number;
      rotation: string | number;
    }[]>`
      select id, pos_x, pos_y, rotation
      from butts
      order by created_at asc
    `;

    const butts = rows.map((r) => ({
      id: r.id,
      pos_x: Number(r.pos_x),
      pos_y: Number(r.pos_y),
      rotation: Number(r.rotation),
    }));

    return NextResponse.json({ butts });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Server error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

type PostBody = {
  message?: string;
  pos_x?: number;
  pos_y?: number;
  rotation?: number;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as PostBody;
    const message = typeof body.message === "string" ? body.message.trim() : "";
    if (!message || message.length > 200) {
      return NextResponse.json({ error: "Invalid message" }, { status: 400 });
    }
    const pos_x = Number(body.pos_x);
    const pos_y = Number(body.pos_y);
    const rotation = Number(body.rotation);
    if (
      !Number.isFinite(pos_x) ||
      !Number.isFinite(pos_y) ||
      !Number.isFinite(rotation)
    ) {
      return NextResponse.json({ error: "Invalid position" }, { status: 400 });
    }

    const sql = getDb();
    const inserted = await sql`
      insert into butts (message, pos_x, pos_y, rotation)
      values (${message}, ${pos_x}, ${pos_y}, ${rotation})
      returning id, message, pos_x, pos_y, rotation, created_at
    `;

    const row = inserted[0] as
      | {
          id: string;
          message: string;
          pos_x: string | number;
          pos_y: string | number;
          rotation: string | number;
          created_at: Date;
        }
      | undefined;
    if (!row) {
      return NextResponse.json({ error: "Insert failed" }, { status: 500 });
    }

    const butt = {
      id: row.id,
      message: row.message,
      pos_x: Number(row.pos_x),
      pos_y: Number(row.pos_y),
      rotation: Number(row.rotation),
      created_at: row.created_at,
    };

    return NextResponse.json({ butt });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Server error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
