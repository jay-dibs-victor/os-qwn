import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const CAL_API_KEY = process.env.CAL_API_KEY;
    if (!CAL_API_KEY) {
      return NextResponse.json({ error: "API Key missing" }, { status: 500 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || "upcoming";

    const response = await fetch(`https://api.cal.com/v2/bookings?status=${status}&limit=100`, {
      headers: {
        "Authorization": `Bearer ${CAL_API_KEY}`,
        "cal-api-version": "2026-05-01"
      }
    });

    const data = await response.json();
    if (!response.ok) {
      return NextResponse.json({ error: data.message || "Failed to fetch bookings" }, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
