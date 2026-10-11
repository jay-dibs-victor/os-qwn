import { NextResponse } from "next/server";
import { sendEmail } from "@/services/resend";

export async function POST(req: Request) {
  try {
    const { email, linkedin } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const debugInfo = { userEmailSent: false, adminEmailSent: false, errors: [] as unknown[] };

    // 1. Send Thank You email to the requester
    try {
      const userRes = await sendEmail({
        to: email,
        subject: "Queens OS: Proposal Request Received",
        html: `
          <div style="background-color: #0a0a0a; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 60px 20px; color: #ffffff; text-align: center;">
            <div style="max-width: 600px; margin: 0 auto; background: #111111; border: 1px solid #222222; border-radius: 24px; padding: 40px; text-align: left; box-shadow: 0 20px 40px rgba(0,0,0,0.5);">
              <div style="margin-bottom: 32px; text-align: center;">
                <h1 style="color: #FFB800; font-size: 28px; font-weight: 800; margin: 0; letter-spacing: -0.02em;">QUEENS OS</h1>
                <p style="color: #666666; font-size: 12px; text-transform: uppercase; letter-spacing: 0.2em; margin-top: 8px;">System Coordination Layer</p>
              </div>

              <p style="font-size: 16px; line-height: 1.7; color: #cccccc; margin-bottom: 24px;">
                Thank you for your interest in the <strong>Queens OS Business Proposal and Executive Summary</strong>.
              </p>

              <div style="background: #0a0a0a; border-radius: 12px; padding: 24px; border: 1px solid #1a1a1a; margin-bottom: 32px;">
                <p style="font-size: 15px; line-height: 1.6; margin: 0; color: #dddddd;">
                  We have received your request. Our team will review your profile and get in touch within <strong>1-3 working days</strong> to provide you with the comprehensive proposal document as well as our detailed <strong>exit strategy</strong>.
                </p>
              </div>

              <div style="text-align: center; border-top: 1px solid #222222; padding-top: 32px; margin-top: 32px;">
                <p style="color: #555555; font-size: 12px; margin: 0;">
                  © ${new Date().getFullYear()} Queens Inc. All rights reserved. <br/>
                  Global Hub
                </p>
              </div>
            </div>
          </div>
        `
      });
      if (userRes.success) debugInfo.userEmailSent = true;
      else debugInfo.errors.push({ type: 'user', error: userRes.error });
    } catch (err) {
      debugInfo.errors.push({ type: 'user_catch', error: err });
    }

    // 2. Send notification to admin (juwavictor@gmail.com)
    try {
      const adminRes = await sendEmail({
        to: "juwavictor@gmail.com",
        subject: "New Proposal Request - Action Required",
        html: `
          <div style="background-color: #0a0a0a; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 60px 20px; color: #ffffff; text-align: center;">
            <div style="max-width: 600px; margin: 0 auto; background: #111111; border: 1px solid #222222; border-radius: 24px; padding: 40px; text-align: left; box-shadow: 0 20px 40px rgba(0,0,0,0.5);">
              <div style="margin-bottom: 32px; text-align: center;">
                <h1 style="color: #FFB800; font-size: 28px; font-weight: 800; margin: 0;">QUEENS OS</h1>
              </div>

              <h2 style="font-size: 20px; margin-bottom: 24px; color: #ffffff; border-bottom: 1px solid #222222; padding-bottom: 16px;">New Document Request</h2>
              
              <div style="background: #0a0a0a; border-radius: 12px; padding: 24px; border: 1px solid #1a1a1a; margin-bottom: 24px;">
                <p style="margin-bottom: 16px;"><strong style="color: #888; font-size: 12px; text-transform: uppercase;">Email Address:</strong><br/> <span style="font-size: 16px;">${email}</span></p>
                <p style="margin-bottom: 0;"><strong style="color: #888; font-size: 12px; text-transform: uppercase;">LinkedIn Profile:</strong><br/> ${linkedin ? `<a href="${linkedin}" style="color: #FFB800; text-decoration: none;">${linkedin}</a>` : '<span style="color: #555;">Not Provided</span>'}</p>
              </div>

              <p style="color: #666666; font-size: 13px; line-height: 1.5;">
                Please verify the profile and send the Proposal PDF manually to the user once approved.
              </p>
            </div>
          </div>
        `
      });
      if (adminRes.success) debugInfo.adminEmailSent = true;
      else debugInfo.errors.push({ type: 'admin', error: adminRes.error });
    } catch (err) {
      debugInfo.errors.push({ type: 'admin_catch', error: err });
    }

    return NextResponse.json({ success: true, debug: debugInfo });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to process request";
    console.error("Proposal API error:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
