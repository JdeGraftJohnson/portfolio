import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

const TO_EMAIL = "john.k.degraft@gmail.com";
// Default uses Resend's sandbox sender (works without DNS verification, sends to account owner only).
// Override with CONTACT_FROM_EMAIL once you verify a custom domain in Resend.
const FROM_EMAIL = process.env.CONTACT_FROM_EMAIL || "onboarding@resend.dev";

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 254;
}

async function verifyTurnstile(token: string, ip: string | null): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return false;

  const body = new URLSearchParams({ secret, response: token });
  if (ip) body.append("remoteip", ip);

  const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    body,
  });
  const data = (await res.json()) as { success?: boolean };
  return data.success === true;
}

export async function POST(req: NextRequest) {
  let payload: { email?: string; message?: string; turnstileToken?: string };
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const visitorEmail = (payload.email || "").trim();
  const message = (payload.message || "").trim().slice(0, 4000);
  const token = (payload.turnstileToken || "").trim();

  if (!isValidEmail(visitorEmail)) {
    return NextResponse.json({ error: "Please enter a valid email." }, { status: 400 });
  }
  if (!token) {
    return NextResponse.json({ error: "Captcha missing." }, { status: 400 });
  }

  const ip = req.headers.get("cf-connecting-ip") || req.headers.get("x-forwarded-for");
  const verified = await verifyTurnstile(token, ip);
  if (!verified) {
    return NextResponse.json({ error: "Captcha failed. Try again." }, { status: 403 });
  }

  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) {
    return NextResponse.json({ error: "Email service not configured." }, { status: 500 });
  }

  const subject = `johndegraft.app contact — ${visitorEmail}`;
  const textBody =
    `New contact from johndegraft.app\n\n` +
    `Visitor email: ${visitorEmail}\n\n` +
    (message ? `Message:\n${message}\n` : `(no message)\n`);

  const emailRes = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: FROM_EMAIL,
      to: [TO_EMAIL],
      reply_to: visitorEmail,
      subject,
      text: textBody,
    }),
  });

  if (!emailRes.ok) {
    const errText = await emailRes.text();
    console.error("Resend error:", errText);
    return NextResponse.json({ error: "Failed to send email." }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
