import { NextResponse } from "next/server";
import { isCigaretteBrand } from "@/lib/cigarette-brands";
import { getDb } from "@/lib/db";
import { isPlaceLocation } from "@/lib/locations";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const locationParam = searchParams.get("location");
    const location = isPlaceLocation(locationParam) ? locationParam : "seoul";
    const sql = getDb();
    const rows = await sql<{
      id: string;
      brand: string;
      location: string;
      pos_x: string | number;
      pos_y: string | number;
      rotation: string | number;
    }[]>`
      select id, brand, location, pos_x, pos_y, rotation
      from butts
      where location = ${location}
      order by created_at asc
    `;

    const butts = rows.map((r) => ({
      id: r.id,
      brand: isCigaretteBrand(r.brand) ? r.brand : "marlboro",
      location: isPlaceLocation(r.location) ? r.location : "seoul",
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
  brand?: string;
  location?: string;
  pos_x?: number;
  pos_y?: number;
  rotation?: number;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as PostBody;
    const message = typeof body.message === "string" ? body.message.trim() : "";
    const brand = body.brand;
    const location = body.location;
    if (!message || message.length > 200) {
      return NextResponse.json({ error: "Invalid message" }, { status: 400 });
    }
    if (!isCigaretteBrand(brand)) {
      return NextResponse.json({ error: "Invalid brand" }, { status: 400 });
    }
    if (!isPlaceLocation(location)) {
      return NextResponse.json({ error: "Invalid location" }, { status: 400 });
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
      insert into butts (message, brand, location, pos_x, pos_y, rotation)
      values (${message}, ${brand}, ${location}, ${pos_x}, ${pos_y}, ${rotation})
      returning id, message, brand, location, pos_x, pos_y, rotation, created_at
    `;

    const row = inserted[0] as
      | {
          id: string;
          message: string;
          brand: string;
          location: string;
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
      brand: isCigaretteBrand(row.brand) ? row.brand : "marlboro",
      location: isPlaceLocation(row.location) ? row.location : "seoul",
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
