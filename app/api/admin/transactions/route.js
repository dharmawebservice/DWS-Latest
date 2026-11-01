import { NextResponse } from "next/server";
import { getAdminSession } from "../../../../lib/auth";
import { getServiceClient } from "../../../../lib/supabase";

async function auth() {
  const session = await getAdminSession();
  if (!session) return null;
  return getServiceClient();
}

export async function GET(req) {
  try {

    const supabase = await auth();

    if (!supabase) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    let query = supabase
      .from("transactions")
      .select("*")
      .order("created_at", { ascending: false });

    if (status && status !== "all") {
      query = query.eq("payment_status", status);
    }

    const { data, error } = await query;

    if (error) {
      console.error("SUPABASE ERROR:", error);

      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error("GET TRANSACTIONS CRASH:", err);

    return NextResponse.json(
      {
        error: err.message,
      },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  const supabase = await auth();
  if (!supabase) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();

  // Auto-generate invoice number
  const invoiceNum = `DWS-${Date.now().toString().slice(-6)}`;
  const { data, error } = await supabase
    .from("transactions")
    .insert([{ ...body, invoice_number: invoiceNum }])
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function PATCH(req) {
  try {
    const supabase = await auth();

    if (!supabase) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();

    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Transaction ID is required" },
        { status: 400 }
      );
    }

    // Remove undefined values
    Object.keys(updates).forEach((key) => {
      if (updates[key] === undefined) {
        delete updates[key];
      }
    });

    const { data, error } = await supabase
      .from("transactions")
      .update(updates)
      .eq("id", id)
      .select();

    if (error) {
      console.error("PATCH Error:", error);

      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    if (!data || data.length === 0) {
      return NextResponse.json(
        { error: "Transaction not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(data[0]);
  } catch (err) {
    console.error(err);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(req) {
  const supabase = await auth();
  if (!supabase) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await req.json();
  const { error } = await supabase.from("transactions").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
