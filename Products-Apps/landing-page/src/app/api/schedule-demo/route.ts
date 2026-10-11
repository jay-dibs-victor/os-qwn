import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { name, email, date, time, prettyDate } = await req.json();

    if (!name || !email || !date || !time) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Parse date and time into ISO string for Cal.com
    let startDateTime: Date;
    if (date.includes('-')) {
        const [year, month, day] = date.split('-').map(Number);
        const timeMatch = time.match(/(\d+):(\d+)\s*(AM|PM)/i);
        if (timeMatch) {
            const [, hours, minutes, ampm] = timeMatch;
            let hr = parseInt(hours);
            if (ampm.toUpperCase() === 'PM' && hr < 12) hr += 12;
            if (ampm.toUpperCase() === 'AM' && hr === 12) hr = 0;
            startDateTime = new Date(year, month - 1, day, hr, parseInt(minutes));
        } else {
            startDateTime = new Date(`${date} ${time}`);
        }
    } else {
        startDateTime = new Date(`${date} ${time}`);
    }

    const CAL_API_KEY = process.env.CAL_API_KEY;
    const CAL_EVENT_TYPE_ID = process.env.CAL_EVENT_TYPE_ID;

    if (!CAL_API_KEY || !CAL_EVENT_TYPE_ID) {
      console.warn("Cal.com credentials missing. Returning mock success.");
      return NextResponse.json({ success: true, mock: true });
    }

    // Create booking via Cal.com API v2
    const calResponse = await fetch("https://api.cal.com/v2/bookings", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${CAL_API_KEY}`,
        "cal-api-version": "2026-02-25"
      },
      body: JSON.stringify({
        start: startDateTime.toISOString(),
        eventTypeId: parseInt(CAL_EVENT_TYPE_ID),
        attendee: {
          name: name,
          email: email,
          timeZone: "UTC",
          language: "en"
        }
      }),
    });

    const result = await calResponse.json();

    if (!calResponse.ok) {
      console.error("Cal.com API Error:", result);
      // Return the actual error message from Cal.com for debugging
      const errorMessage = result.message || result.error?.message || JSON.stringify(result);
      return NextResponse.json({ error: `Cal.com Error: ${errorMessage}` }, { status: 500 });
    }

    // In API v2, the data is usually under result.data
    const calData = result.data || result;
    const hangoutLink = calData.location || (calData.booking?.location) || "";

    // 1. Send confirmation email via Resend to the USER
    try {
      const { sendEmail } = await import("@/services/resend");
      await sendEmail({
        to: email,
        subject: "Queens OS: Demo Session Confirmed",
        html: `
          <div style="background-color: #0a0a0a; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 60px 20px; color: #ffffff; text-align: center;">
            <div style="max-width: 600px; margin: 0 auto; background: #111111; border: 1px solid #222222; border-radius: 24px; padding: 40px; text-align: left; box-shadow: 0 20px 40px rgba(0,0,0,0.5);">
              <div style="margin-bottom: 32px; text-align: center;">
                <h1 style="color: #FFB800; font-size: 28px; font-weight: 800; margin: 0; letter-spacing: -0.02em;">QUEENS OS</h1>
                <p style="color: #666666; font-size: 12px; text-transform: uppercase; letter-spacing: 0.2em; margin-top: 8px;">Demo Session Confirmed</p>
              </div>

              <h2 style="font-size: 20px; margin-bottom: 24px; color: #ffffff;">Hi ${name}, Your Demo is Set!</h2>
              
              <div style="background: #0a0a0a; border-radius: 12px; padding: 24px; border: 1px solid #1a1a1a; margin-bottom: 32px;">
                <div style="margin-bottom: 16px;">
                  <p style="color: #888888; font-size: 13px; text-transform: uppercase; margin-bottom: 4px;">Scheduled For</p>
                  <p style="font-size: 18px; margin: 0; font-weight: 700; color: #FFB800;">${prettyDate || date}</p>
                  <p style="font-size: 16px; margin: 4px 0 0 0; color: #ffffff;">${time}</p>
                </div>
                
                ${hangoutLink ? `
                  <div style="border-top: 1px solid #222222; padding-top: 16px; margin-top: 16px;">
                    <p style="color: #888888; font-size: 13px; text-transform: uppercase; margin-bottom: 12px;">Meeting Link</p>
                    <a href="${hangoutLink}" style="display: inline-block; background: #FFB800; color: #000000; padding: 12px 24px; border-radius: 10px; font-weight: 800; text-decoration: none; font-size: 14px;">Join Google Meet</a>
                  </div>
                ` : ""}
              </div>

              <p style="color: #666666; font-size: 14px; line-height: 1.6;">
                A calendar invitation has also been sent to your email with the full details.
              </p>
            </div>
          </div>
        `
      });

      // 2. Send notification to ADMIN
      await sendEmail({
        to: "juwavictor@gmail.com",
        subject: "New Demo Scheduled - Queens OS",
        html: `
          <div style="background-color: #0a0a0a; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 60px 20px; color: #ffffff; text-align: center;">
            <div style="max-width: 600px; margin: 0 auto; background: #111111; border: 1px solid #222222; border-radius: 24px; padding: 40px; text-align: left; box-shadow: 0 20px 40px rgba(0,0,0,0.5);">
              <div style="margin-bottom: 32px; text-align: center;">
                <h1 style="color: #FFB800; font-size: 28px; font-weight: 800; margin: 0;">QUEENS OS</h1>
                <p style="color: #666666; font-size: 12px; text-transform: uppercase; letter-spacing: 0.2em; margin-top: 8px;">Internal Notification</p>
              </div>

              <h2 style="font-size: 20px; margin-bottom: 24px; color: #ffffff; border-bottom: 1px solid #222222; padding-bottom: 16px;">New Demo Booking</h2>
              
              <div style="background: #0a0a0a; border-radius: 12px; padding: 24px; border: 1px solid #1a1a1a; margin-bottom: 24px;">
                <p style="margin-bottom: 16px;"><strong style="color: #888; font-size: 12px; text-transform: uppercase;">Client Information:</strong><br/> <span style="font-size: 18px; font-weight: 700;">${name}</span><br/><span style="color: #FFB800;">${email}</span></p>
                <p style="margin-bottom: 0;"><strong style="color: #888; font-size: 12px; text-transform: uppercase;">Session Time:</strong><br/> ${prettyDate || date} at ${time}</p>
              </div>

              ${hangoutLink ? `<p style="color: #666666; font-size: 13px;">Meeting created: <a href="${hangoutLink}" style="color: #FFB800;">Google Meet Link</a></p>` : ""}
            </div>
          </div>
        `
      });
    } catch (mailErr) {
      console.error("Confirmation email failed:", mailErr);
    }

    return NextResponse.json({ 
      success: true, 
      bookingId: calData.id || (calData.booking?.id),
      hangoutLink: hangoutLink 
    });

  } catch (error: unknown) {
    console.error("Cal.com Booking Error:", error);
    const message = error instanceof Error ? error.message : "Failed to schedule demo";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
