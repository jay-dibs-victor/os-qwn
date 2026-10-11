import { NextResponse } from "next/server";
import { sendEmail } from "@/services/resend";

export async function POST(req: Request) {
  try {
    const { name, email, message } = await req.json();

    if (!name || !email || !message) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const result = await sendEmail({
      to: "juwavictor@gmail.com",
      subject: `New Contact Message from ${name}`,
      html: `
        <div style="background-color: #0a0a0a; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 60px 20px; color: #ffffff; text-align: center;">
          <div style="max-width: 600px; margin: 0 auto; background: #111111; border: 1px solid #222222; border-radius: 24px; padding: 40px; text-align: left; box-shadow: 0 20px 40px rgba(0,0,0,0.5);">
            <div style="margin-bottom: 32px; text-align: center;">
              <h1 style="color: #FFB800; font-size: 28px; font-weight: 800; margin: 0; letter-spacing: -0.02em;">QUEENS OS</h1>
              <p style="color: #666666; font-size: 12px; text-transform: uppercase; letter-spacing: 0.2em; margin-top: 8px;">System Coordination Layer</p>
            </div>

            <h2 style="font-size: 20px; margin-bottom: 24px; color: #ffffff; border-bottom: 1px solid #222222; padding-bottom: 16px;">New Contact Inquiry</h2>
            
            <div style="margin-bottom: 24px;">
              <p style="color: #888888; font-size: 13px; text-transform: uppercase; margin-bottom: 4px;">From</p>
              <p style="font-size: 16px; margin: 0; font-weight: 600;">${name} <span style="color: #FFB800; font-weight: normal;">&lt;${email}&gt;</span></p>
            </div>

            <div style="margin-bottom: 32px; background: #0a0a0a; border-radius: 12px; padding: 20px; border: 1px solid #1a1a1a;">
              <p style="color: #888888; font-size: 13px; text-transform: uppercase; margin-bottom: 8px;">Message Content</p>
              <p style="font-size: 15px; line-height: 1.6; margin: 0; color: #dddddd;">${message.replace(/\n/g, "<br/>")}</p>
            </div>

            <div style="text-align: center; border-top: 1px solid #222222; padding-top: 32px; margin-top: 32px;">
              <p style="color: #555555; font-size: 12px; margin: 0;">
                Queens OS • Global Hub • ${new Date().getFullYear()}
              </p>
            </div>
          </div>
        </div>
      `,
    });

    if (!result.success) {
      return NextResponse.json({ error: "Failed to deliver email" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to send message";
    console.error("Contact form error:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
