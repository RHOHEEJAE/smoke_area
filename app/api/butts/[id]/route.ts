import { NextResponse } from "next/server";
import { getDb, isValidButtId } from "@/lib/db";

type Params = { params: { id: string } };

export async function GET(_request: Request, { params }: Params) {
  try {
    const { id } = params;
    if (!id || !isValidButtId(id)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }

    const sql = getDb();
    const rows = await sql<{ message: string; warm_until: Date | string | null }[]>`
      select message, warm_until from butts where id = ${id}
    `;

    const row = rows[0];
    if (!row) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const comments = await sql<{
      id: string;
      author: string;
      content: string;
      created_at: Date | string;
    }[]>`
      select id, author, content, created_at
      from butt_comments
      where butt_id = ${id}
      order by created_at asc
    `;

    return NextResponse.json({
      message: row.message,
      warm_until: row.warm_until ? new Date(row.warm_until).toISOString() : null,
      comments: comments.map((c) => ({
        id: c.id,
        author: c.author,
        content: c.content,
        created_at: new Date(c.created_at).toISOString(),
      })),
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Server error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  try {
    const { id } = params;
    if (!id || !isValidButtId(id)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }

    const sql = getDb();
    const warmState = await sql<{ warm_until: Date | string | null }[]>`
      select warm_until from butts where id = ${id}
    `;
    const warmUntil = warmState[0]?.warm_until
      ? new Date(warmState[0].warm_until).getTime()
      : 0;
    if (warmUntil > Date.now()) {
      return NextResponse.json(
        { error: "온기가 남아 있어 아직 주울 수 없습니다." },
        { status: 409 }
      );
    }
    await sql`
      delete from butts where id = ${id}
    `;

    return NextResponse.json({ success: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Server error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
