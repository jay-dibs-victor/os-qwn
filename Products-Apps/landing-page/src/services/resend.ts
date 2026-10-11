import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

if (!process.env.RESEND_API_KEY) {
    console.error("CRITICAL: RESEND_API_KEY is missing from environment variables!");
}

export const sendEmail = async ({
  to,
  subject,
  html,
  attachments = []
}: {
  to: string;
  subject: string;
  html: string;
  attachments?: { Filename: string; Base64Content: string }[];
}) => {
  if (!process.env.RESEND_API_KEY) {
    console.warn("Resend API key missing. Skipping email send.");
    return { success: true, mock: true };
  }

  try {
    console.log(`[Resend] Attempting to send email to: ${to} | Subject: ${subject}`);
    
    const { data, error } = await resend.emails.send({
      from: 'onboarding@resend.dev', // Simplified from address
      to: [to],
      subject: subject,
      html: html,
      attachments: attachments?.map(att => ({
        filename: att.Filename,
        content: att.Base64Content,
      })) || []
    });

    if (error) {
      console.error("[Resend] API Error:", error);
      return { success: false, error };
    }

    console.log("[Resend] Success:", data);
    return { success: true, data };
  } catch (error) {
    console.error("[Resend] Unexpected Error:", error);
    throw error;
  }
};
