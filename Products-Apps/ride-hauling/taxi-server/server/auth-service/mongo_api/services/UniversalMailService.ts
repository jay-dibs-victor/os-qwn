/**
 * UniversalMailService — Queens OS
 *
 * Sends transactional emails via SendGrid.
 * The API key is read at call-time (not at module load), so it works
 * whether the key comes from process.env or is injected later.
 *
 * Supported templates (Handlebars .html files in views/templates/):
 *   signup-verification  → locals: { username, code }
 *   reset-password       → locals: { username, code }
 *   welcome              → locals: { username }
 */

import path from 'path';
import fs from 'fs';
import handlebars from 'handlebars';

// ─── Fallback key (configure SENDGRID_API_KEY in the environment) ─────────
const SENDGRID_KEY_FALLBACK = process.env.SENDGRID_API_KEY ?? '';
// Verified SendGrid Sender Identity
const FROM_EMAIL_FALLBACK   = 'Queens OS <oshinbolubrian@gmail.com>';

export interface MailOptions {
  from?: string;
  to: string;
  subject: string;
  text?: string;
  html?: string;
  template?: string;   // template name without extension
  locals?: Record<string, any>;
}

class UniversalMailService {
  private templateDir: string;

  constructor() {
    this.templateDir = path.join(__dirname, '../views/templates');
  }

  // ── Public send method ──────────────────────────────────────────────────
  async send(options: MailOptions): Promise<any> {
    // Render template if provided
    if (options.template) {
      const { html, text } = this.renderTemplate(options.template, options.locals || {});
      options.html = html;
      options.text = options.text || text;
    }

    return this.sendViaSendGrid(options);
  }

  // ── SendGrid direct call ────────────────────────────────────────────────
  private async sendViaSendGrid(options: MailOptions): Promise<any> {
    const apiKey = process.env.SENDGRID_API_KEY || SENDGRID_KEY_FALLBACK;
    const from   = options.from || process.env.EMAIL_FROM || FROM_EMAIL_FALLBACK;

    const payload = {
      personalizations: [{ to: [{ email: options.to }] }],
      from: this.parseFrom(from),
      subject: options.subject,
      content: [] as { type: string; value: string }[],
    };

    if (options.text) {
      payload.content.push({ type: 'text/plain', value: options.text });
    }
    if (options.html) {
      payload.content.push({ type: 'text/html', value: options.html });
    }
    if (payload.content.length === 0) {
      payload.content.push({ type: 'text/plain', value: options.subject });
    }

    console.log(`[Mail] Sending "${options.subject}" to ${options.to} via SendGrid`);

    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const body = await response.text();
      console.error(`[Mail] SendGrid error ${response.status}:`, body);
      throw new Error(`SendGrid ${response.status}: ${body}`);
    }

    console.log(`[Mail] ✓ Delivered to ${options.to} (${response.status})`);
    return { status: response.status };
  }

  // ── Template renderer ───────────────────────────────────────────────────
  private renderTemplate(templateName: string, locals: Record<string, any>): { html: string; text: string } {
    const htmlPath = path.join(this.templateDir, `${templateName}.html`);

    if (!fs.existsSync(htmlPath)) {
      // Fallback: plain text email
      console.warn(`[Mail] Template not found: ${htmlPath} — using plain text fallback`);
      const text = Object.entries(locals)
        .map(([k, v]) => `${k}: ${v}`)
        .join('\n');
      return { html: `<pre>${text}</pre>`, text };
    }

    const source   = fs.readFileSync(htmlPath, 'utf8');
    const template = handlebars.compile(source);
    const html     = template(locals);
    const text     = html.replace(/<[^>]*>/g, '').replace(/\s{2,}/g, ' ').trim();
    return { html, text };
  }

  // ── Parse "Name <email>" format ─────────────────────────────────────────
  private parseFrom(from: string): { name: string; email: string } {
    const match = from.match(/^(.*?)\s*<(.+?)>$/);
    if (match) return { name: match[1].trim(), email: match[2].trim() };
    return { name: 'Queens OS', email: from.trim() };
  }
}

// ── Singleton export ────────────────────────────────────────────────────────
const mailService = new UniversalMailService();
export default mailService;
