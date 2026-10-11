import { NextResponse } from "next/server";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ uid: string; action: string }> }
) {
  try {
    const { uid, action } = await params;
    const body = await req.json();
    const CAL_API_KEY = process.env.CAL_API_KEY;

    if (!CAL_API_KEY) {
      return NextResponse.json({ error: "API Key missing" }, { status: 500 });
    }

    if (action !== "reschedule" && action !== "cancel") {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    const response = await fetch(`https://api.cal.com/v2/bookings/${uid}/${action}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${CAL_API_KEY}`,
        "cal-api-version": "2026-02-25"
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    if (!response.ok) {
      return NextResponse.json({ error: data.message || `Failed to ${action} booking` }, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
