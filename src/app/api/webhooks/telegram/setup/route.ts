/**
 * Telegram Webhook Setup Route
 * Call GET /api/webhooks/telegram/setup?url=YOUR_PUBLIC_URL
 * to register the webhook with Telegram's servers
 */
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    return NextResponse.json({ error: "TELEGRAM_BOT_TOKEN not set" }, { status: 400 });
  }

  const appUrl =
    req.nextUrl.searchParams.get("url") ||
    process.env.NEXT_PUBLIC_APP_URL ||
    "http://localhost:3000";

  const webhookUrl = `${appUrl}/api/webhooks/telegram`;

  try {
    // Register the webhook
    const res = await fetch(
      `https://api.telegram.org/bot${token}/setWebhook`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: webhookUrl,
          allowed_updates: ["message", "callback_query"],
        }),
      }
    );
    const data = await res.json();

    // Also get bot info
    const botInfoRes = await fetch(`https://api.telegram.org/bot${token}/getMe`);
    const botInfo = await botInfoRes.json();

    return NextResponse.json({
      webhook: data,
      bot: botInfo.result,
      webhookUrl,
      message: data.ok
        ? `✅ Webhook registered at ${webhookUrl}`
        : `❌ Failed: ${data.description}`,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE() {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    return NextResponse.json({ error: "TELEGRAM_BOT_TOKEN not set" }, { status: 400 });
  }

  const res = await fetch(`https://api.telegram.org/bot${token}/deleteWebhook`, {
    method: "POST",
  });
  const data = await res.json();
  return NextResponse.json(data);
}
