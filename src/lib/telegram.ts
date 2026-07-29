/**
 * Telegram Bot Utility Library
 */

// Dynamic getter so env vars are always read at runtime
const getTelegramBase = () =>
  `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}`;

export interface TelegramMessage {
  chat_id: string | number;
  text: string;
  parse_mode?: "HTML" | "Markdown" | "MarkdownV2";
  reply_markup?: object;
}

export interface ApprovalCardData {
  ideaId: string;
  platform: string;
  pillarName: string;
  pillarId?: string;
  brandId?: string;
  title: string;
  hook: string;
  body: string;
  cta: string;
  hashtags: string[];
  brandName: string;
}

const PLATFORM_EMOJI: Record<string, string> = {
  instagram: "📸",
  facebook: "👥",
  linkedin: "💼",
  pinterest: "📌",
  youtube: "▶️",
  whatsapp: "💬",
};

/**
 * Send a raw message to Telegram chat
 */
export async function sendTelegramMessage(
  chatId: string | number,
  text: string,
  replyMarkup?: object
): Promise<{ ok: boolean; result?: any; error?: string }> {
  if (!process.env.TELEGRAM_BOT_TOKEN) {
    return { ok: false, error: "TELEGRAM_BOT_TOKEN not set" };
  }

  try {
    const TELEGRAM_API_BASE = getTelegramBase();
    const body: TelegramMessage = {
      chat_id: chatId,
      text,
      parse_mode: "HTML",
      ...(replyMarkup ? { reply_markup: replyMarkup } : {}),
    };

    console.log("[Telegram] Calling:", `${TELEGRAM_API_BASE}/sendMessage`);
    const res = await fetch(`${TELEGRAM_API_BASE}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const rawText = await res.text();
    console.log("[Telegram] Raw response:", rawText.slice(0, 200));
    const data = JSON.parse(rawText);
    return data;
  } catch (error: any) {
    console.error("[Telegram] sendMessage error:", error.message);
    return { ok: false, error: error.message };
  }
}

/**
 * Edit an existing Telegram message (used to update status after approval)
 */
export async function editTelegramMessage(
  chatId: string | number,
  messageId: number,
  text: string,
  replyMarkup?: object
): Promise<{ ok: boolean; result?: any; error?: string }> {
  if (!process.env.TELEGRAM_BOT_TOKEN) {
    return { ok: false, error: "TELEGRAM_BOT_TOKEN not set" };
  }

  try {
    const TELEGRAM_API_BASE = getTelegramBase();
    const body: any = {
      chat_id: chatId,
      message_id: messageId,
      text,
      parse_mode: "HTML",
      ...(replyMarkup ? { reply_markup: replyMarkup } : {}),
    };

    const res = await fetch(`${TELEGRAM_API_BASE}/editMessageText`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    return data;
  } catch (error: any) {
    console.error("Telegram editMessage error:", error);
    return { ok: false, error: error.message };
  }
}

/**
 * Answer a callback query (removes the "loading" state from Telegram inline button)
 */
export async function answerCallbackQuery(
  callbackQueryId: string,
  text?: string
): Promise<void> {
  if (!process.env.TELEGRAM_BOT_TOKEN) return;
  const TELEGRAM_API_BASE = getTelegramBase();
  await fetch(`${TELEGRAM_API_BASE}/answerCallbackQuery`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      callback_query_id: callbackQueryId,
      text: text || "✅ Done!",
      show_alert: false,
    }),
  });
}

/**
 * Send a rich approval card for a generated post idea
 */
export async function sendApprovalCard(
  chatId: string | number,
  data: ApprovalCardData
): Promise<{ ok: boolean; messageId?: number; error?: string }> {
  const platformEmoji = PLATFORM_EMOJI[data.platform.toLowerCase()] || "📱";
  const hashtagStr =
    data.hashtags.length > 0
      ? data.hashtags
          .slice(0, 5)
          .map((h) => `#${h.replace(/^#/, "")}`)
          .join(" ")
      : "";

  const text =
    `🚀 <b>New AI Post Idea Ready for Approval!</b>\n\n` +
    `${platformEmoji} <b>Platform:</b> ${data.platform.charAt(0).toUpperCase() + data.platform.slice(1)}\n` +
    `📂 <b>Pillar:</b> ${data.pillarName}\n` +
    `🏷️ <b>Brand:</b> ${data.brandName}\n\n` +
    `━━━━━━━━━━━━━━━━━━━━\n\n` +
    `💡 <b>${data.title}</b>\n\n` +
    `🎯 <b>Hook:</b>\n<i>${data.hook}</i>\n\n` +
    `📝 <b>Caption:</b>\n${data.body}\n\n` +
    `📣 <b>CTA:</b>\n<i>${data.cta}</i>\n\n` +
    (hashtagStr ? `🏷 <b>Hashtags:</b>\n<code>${hashtagStr}</code>\n\n` : "") +
    `━━━━━━━━━━━━━━━━━━━━\n` +
    `<i>Approve to add to calendar, Reject to discard.</i>`;

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "";
  const hasPublicUrl = appUrl.startsWith("https://");

  // Simple regen callback: just regen:ideaId — details fetched from Firestore
  const regenData = `regen:${data.ideaId}`;

  const replyMarkup = {
    inline_keyboard: [
      [
        {
          text: "✅ Approve",
          callback_data: `approve:${data.ideaId}`,
        },
        {
          text: "❌ Reject",
          callback_data: `reject:${data.ideaId}`,
        },
      ],
      [
        {
          text: "🔄 New Idea",
          callback_data: regenData,
        },
      ],
      // Only add URL button if we have a real public https URL
      ...(hasPublicUrl
        ? [
            [
              {
                text: "✏️ View in Dashboard",
                url: `${appUrl}/dashboard/approvals`,
              },
            ],
          ]
        : []),
    ],
  };

  const result = await sendTelegramMessage(chatId, text, replyMarkup);

  if (result.ok && result.result?.message_id) {
    return { ok: true, messageId: result.result.message_id };
  }

  return { ok: false, error: result.error || "Failed to send" };
}

/**
 * Send a notification message (simple, no buttons)
 */
export async function sendNotification(
  chatId: string | number,
  message: string
): Promise<void> {
  await sendTelegramMessage(chatId, message);
}
