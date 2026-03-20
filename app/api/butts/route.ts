import { NextResponse } from "next/server";
import { createRouteHandlerClient } from "@/lib/supabase/admin";

export async function GET() {
  try {
    const supabase = createRouteHandlerClient();
    const { data, error } = await supabase
      .from("butts")
      .select("id, pos_x, pos_y, rotation")
      .order("created_at", { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ butts: data ?? [] });
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

    const supabase = createRouteHandlerClient();
    const { data, error } = await supabase
      .from("butts")
      .insert({
        message,
        pos_x,
        pos_y,
        rotation,
      })
      .select("id, message, pos_x, pos_y, rotation, created_at")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ butt: data });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Server error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
