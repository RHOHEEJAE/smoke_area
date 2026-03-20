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
    const rows = await sql<{ message: string }[]>`
      select message from butts where id = ${id}
    `;

    const row = rows[0];
    if (!row) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ message: row.message });
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
    await sql`
      delete from butts where id = ${id}
    `;

    return NextResponse.json({ success: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Server error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
