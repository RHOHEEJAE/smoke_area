import { NextResponse } from "next/server";
import { getDb, isValidButtId } from "@/lib/db";
import { hashPassword } from "@/lib/security";

type Params = { params: { id: string } };

type CreateBody = {
  author?: string;
  password?: string;
  content?: string;
};

export async function POST(request: Request, { params }: Params) {
  try {
    const { id } = params;
    if (!id || !isValidButtId(id)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }
    const body = (await request.json()) as CreateBody;
    const author = typeof body.author === "string" ? body.author.trim() : "";
    const password =
      typeof body.password === "string" ? body.password.trim() : "";
    const content = typeof body.content === "string" ? body.content.trim() : "";
    if (!author || author.length > 30) {
      return NextResponse.json({ error: "아이디는 1~30자입니다." }, { status: 400 });
    }
    if (!password || password.length < 4 || password.length > 40) {
      return NextResponse.json(
        { error: "비밀번호는 4~40자로 입력하세요." },
        { status: 400 }
      );
    }
    if (!content || content.length > 200) {
      return NextResponse.json({ error: "댓글은 1~200자입니다." }, { status: 400 });
    }

    const sql = getDb();
    const commentRows = await sql<{
      id: string;
      author: string;
      content: string;
      created_at: Date | string;
    }[]>`
      insert into butt_comments (butt_id, author, content, password_hash)
      values (${id}, ${author}, ${content}, ${hashPassword(password)})
      returning id, author, content, created_at
    `;
    await sql`
      update butts
      set warm_until = now() + interval '1 hour'
      where id = ${id}
    `;

    const row = commentRows[0];
    if (!row) {
      return NextResponse.json({ error: "댓글 저장 실패" }, { status: 500 });
    }
    return NextResponse.json({
      comment: {
        id: row.id,
        author: row.author,
        content: row.content,
        created_at: new Date(row.created_at).toISOString(),
      },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Server error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

type DeleteBody = {
  commentId?: string;
  password?: string;
};

export async function DELETE(request: Request, { params }: Params) {
  try {
    const { id } = params;
    if (!id || !isValidButtId(id)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }
    const body = (await request.json()) as DeleteBody;
    const commentId =
      typeof body.commentId === "string" ? body.commentId.trim() : "";
    const password =
      typeof body.password === "string" ? body.password.trim() : "";
    if (!commentId || !isValidButtId(commentId)) {
      return NextResponse.json({ error: "Invalid comment id" }, { status: 400 });
    }
    if (!password) {
      return NextResponse.json({ error: "비밀번호를 입력하세요." }, { status: 400 });
    }

    const sql = getDb();
    const rows = await sql<{ password_hash: string }[]>`
      select password_hash
      from butt_comments
      where id = ${commentId}
        and butt_id = ${id}
      limit 1
    `;
    const row = rows[0];
    if (!row) {
      return NextResponse.json({ error: "댓글을 찾을 수 없습니다." }, { status: 404 });
    }
    if (row.password_hash !== hashPassword(password)) {
      return NextResponse.json({ error: "비밀번호가 틀렸습니다." }, { status: 403 });
    }

    await sql`
      delete from butt_comments
      where id = ${commentId}
        and butt_id = ${id}
    `;
    return NextResponse.json({ success: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Server error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
