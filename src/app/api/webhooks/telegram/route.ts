/**
 * Telegram Webhook Handler
 * Handles: approve / reject / regen callbacks + /start command
 */
import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { answerCallbackQuery, editTelegramMessage } from "@/lib/telegram";

export async function POST(req: NextRequest) {
  try {
    const update = await req.json();

    // ── CALLBACK QUERIES (button presses) ──────────────────────────────
    if (update.callback_query) {
      const query = update.callback_query;
      const callbackData: string = query.data || "";
      const messageId: number = query.message?.message_id;
      const chatId: number = query.message?.chat?.id;
      const originalText: string = query.message?.text || "";

      // ── 🔄 REGENERATE ──────────────────────────────────────────────
      if (callbackData.startsWith("regen:")) {
        await answerCallbackQuery(query.id, "🔄 Generating new idea...");

        // Parse: regen:ideaId — fetch rest from Firestore
        const ideaId = callbackData.split(":")[1] || "";

        // Fetch original idea to get platform/brandId/pillarId
        let platform = "instagram";
        let brandId = "";
        let pillarId = "";
        let oldTitle = "";

        try {
          const ideaSnap = await adminDb.collection("ideas").doc(ideaId).get();
          if (ideaSnap.exists) {
            const ideaData = ideaSnap.data()!;
            platform = ideaData.platform || "instagram";
            brandId = ideaData.brandId || "";
            pillarId = ideaData.pillarId || "";
            oldTitle = ideaData.title || "";
          }
        } catch (e) {
          console.error("[Regen] Failed to fetch idea:", e);
        }

        // Update original message to show loading state
        await editTelegramMessage(
          chatId,
          messageId,
          `⏳ <b>Generating a fresh idea for ${platform.charAt(0).toUpperCase() + platform.slice(1)}...</b>\n\n<i>AI is thinking of a completely new angle for you!</i>`,
          { inline_keyboard: [] }
        );

        // Call regenerate API internally
        try {
          const appUrl =
            process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
          const res = await fetch(`${appUrl}/api/ai/regenerate-idea`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ brandId, platform, pillarId, excludeTitle: oldTitle }),
          });

          if (!res.ok) {
            throw new Error(`API error: ${res.status}`);
          }

          // Success — new card already sent by the API via sendApprovalCard
          await editTelegramMessage(
            chatId,
            messageId,
            `✅ <b>New idea generated!</b>\n\n<i>Check the new card below 👇</i>`,
            { inline_keyboard: [] }
          );
        } catch (err: any) {
          console.error("[Regen Error]", err);
          await editTelegramMessage(
            chatId,
            messageId,
            `❌ <b>Generation failed.</b>\n\n<i>Error: ${err.message}</i>\n\nPlease try again from the dashboard.`,
            { inline_keyboard: [] }
          );
        }

        return NextResponse.json({ ok: true });
      }

      // ── ✅ APPROVE / ❌ REJECT ──────────────────────────────────────
      const [action, ideaId] = callbackData.split(":");

      if (!ideaId || !["approve", "reject"].includes(action)) {
        await answerCallbackQuery(query.id, "Unknown action.");
        return NextResponse.json({ ok: true });
      }

      const ideasRef = adminDb.collection("ideas");
      const snap = await ideasRef.doc(ideaId).get();

      if (!snap.exists) {
        await answerCallbackQuery(query.id, "⚠️ Post idea not found.");
        return NextResponse.json({ ok: true });
      }

      const newStatus = action === "approve" ? "approved" : "rejected";
      const statusEmoji = action === "approve" ? "✅" : "❌";
      const statusLabel = action === "approve" ? "APPROVED" : "REJECTED";

      await ideasRef.doc(ideaId).update({
        status: newStatus,
        updatedAt: new Date().toISOString(),
        approvedVia: "telegram",
        approvedAt: new Date().toISOString(),
      });

      await answerCallbackQuery(
        query.id,
        action === "approve"
          ? "✅ Post approved! Added to calendar."
          : "❌ Post rejected and discarded."
      );

      // Edit message to show final status (no buttons)
      const statusTime = new Date().toLocaleString("en-IN", {
        timeZone: "Asia/Kolkata",
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      });

      const updatedText =
        `${statusEmoji} <b>Post ${statusLabel}</b>\n\n` +
        originalText
          .replace(/\n<i>Approve to add to calendar[\s\S]*<\/i>$/, "")
          .replace(/^🚀 <b>New AI Post Idea Ready for Approval!<\/b>/, `${statusEmoji} <b>Post ${statusLabel}</b>`)
          .trim() +
        `\n\n━━━━━━━━━━━━━━━━━━━━\n` +
        `<i>Updated: ${statusTime} via Telegram</i>`;

      await editTelegramMessage(chatId, messageId, updatedText, {
        inline_keyboard: [],
      });

      return NextResponse.json({ ok: true });
    }

    // ── TEXT MESSAGES (/start command) ─────────────────────────────────
    if (update.message) {
      const text = update.message.text || "";
      const chatId = update.message.chat?.id;

      if (text.startsWith("/start")) {
        const { sendTelegramMessage } = await import("@/lib/telegram");
        await sendTelegramMessage(
          chatId,
          `🤖 <b>Welcome to Softecai SMEAI Bot!</b>\n\n` +
            `I send you AI-generated post ideas from your dashboard for approval.\n\n` +
            `<b>Buttons on each card:</b>\n` +
            `✅ <b>Approve</b> — Add to content calendar\n` +
            `❌ <b>Reject</b> — Discard the idea\n` +
            `🔄 <b>New Idea</b> — Generate a fresh suggestion for the same platform\n\n` +
            `Your Chat ID: <code>${chatId}</code>`
        );
      }

      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error("Telegram webhook error:", error);
    return NextResponse.json(
      { ok: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ status: "Telegram webhook active ✅" });
}
