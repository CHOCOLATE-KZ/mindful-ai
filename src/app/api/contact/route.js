import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export const runtime = "nodejs";

/**
 * Простая in-memory защита от спама (для dev/одного сервера).
 * В проде лучше Redis (Upstash) — иначе после перезапуска всё сбросится.
 */
const BUCKET = globalThis.__CONTACT_RATE__ || (globalThis.__CONTACT_RATE__ = new Map());

function getIp(req) {
  // Vercel/Proxy
  const xf = req.headers.get("x-forwarded-for");
  if (xf) return xf.split(",")[0].trim();
  return "local";
}

function rateLimit(ip, limit = 5, windowMs = 10 * 60 * 1000) {
  const now = Date.now();
  const rec = BUCKET.get(ip) || { count: 0, resetAt: now + windowMs };

  if (now > rec.resetAt) {
    rec.count = 0;
    rec.resetAt = now + windowMs;
  }

  rec.count += 1;
  BUCKET.set(ip, rec);

  return { ok: rec.count <= limit, resetAt: rec.resetAt, count: rec.count };
}

function clamp(s, max) {
  return (s || "").toString().trim().slice(0, max);
}

export async function POST(req) {
  try {
    const ip = getIp(req);
    const rl = rateLimit(ip);

    if (!rl.ok) {
      return NextResponse.json(
        { error: "Слишком много сообщений. Попробуйте позже." },
        { status: 429 }
      );
    }

    const body = await req.json().catch(() => ({}));

    // honeypot (если кто-то пытается имитировать форму)
    if (body?.company) {
      return NextResponse.json({ ok: true }); // тихий “успех” для бота
    }

    const name = clamp(body?.name, 60);
    const email = clamp(body?.email, 120);
    const message = clamp(body?.message, 2000);

    if (!name || !email || !message) {
      return NextResponse.json({ error: "Заполните имя, email и сообщение" }, { status: 400 });
    }

    // минимальная валидация email
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Некорректный email" }, { status: 400 });
    }

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: 465,
      secure: true,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });

    await transporter.sendMail({
      from: `"MindfulAI" <${process.env.SMTP_USER}>`,
      to: process.env.CONTACT_TO,
      replyTo: email,
      subject: `MindfulAI • Contact: ${name}`,
      text: `Имя: ${name}\nEmail: ${email}\nIP: ${ip}\n\nСообщение:\n${message}`,
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("CONTACT_SEND_ERROR:", e);
    return NextResponse.json({ error: "Ошибка отправки письма" }, { status: 500 });
  }
}
