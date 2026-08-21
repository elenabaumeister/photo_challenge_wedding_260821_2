import { NextRequest, NextResponse } from "next/server";
import QRCode from "qrcode";
import { supabaseAdmin } from "../../../lib/supabase";

function authorized(req: NextRequest) {
  return req.headers.get("x-admin-password") === process.env.ADMIN_PASSWORD;
}

export async function GET(req: NextRequest) {
  if (!authorized(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { data, error } = await supabaseAdmin.from("challenges").select("*").order("created_at");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

export async function POST(req: NextRequest) {
  if (!authorized(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const task = String(body.task || "").trim();
  if (!task) return NextResponse.json({ error: "Task is required" }, { status: 400 });

  const { data, error } = await supabaseAdmin.from("challenges").insert({ task, active: true }).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const base = process.env.NEXT_PUBLIC_APP_URL || req.nextUrl.origin;
  const url = `${base}/challenge/${data.id}`;
  const qr = await QRCode.toDataURL(url, { width: 900, margin: 2 });

  return NextResponse.json({ ...data, url, qr });
}

export async function PATCH(req: NextRequest) {
  if (!authorized(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const { id, active } = body;
  const { error } = await supabaseAdmin.from("challenges").update({ active: Boolean(active) }).eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}