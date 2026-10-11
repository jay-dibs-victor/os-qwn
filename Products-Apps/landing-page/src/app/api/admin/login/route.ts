import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { password } = await req.json();
    const db = await getDb();

    // Default to 'admin' username
    const admin = await db.get("SELECT * FROM admins WHERE username = 'admin'");

    if (!admin) {
      return NextResponse.json({ error: "Admin account not found" }, { status: 404 });
    }

    const isMatch = await bcrypt.compare(password, admin.password);

    if (isMatch) {
      // In a real app, you'd set a cookie/JWT here
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Invalid password" }, { status: 401 });
  } catch (error: any) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
