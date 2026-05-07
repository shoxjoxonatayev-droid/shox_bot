import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import TelegramBot from "node-telegram-bot-api";
import dotenv from "dotenv";

dotenv.config();

const token = process.env.TELEGRAM_BOT_TOKEN;
const appUrl = process.env.APP_URL;

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;

  // =======================
  // TELEGRAM BOT (SAFE MODE)
  // =======================
  if (token && appUrl) {
    const bot = new TelegramBot(token, { polling: true });

    console.log("🤖 Bot ishga tushdi...");
    console.log("🌐 Web App URL:", appUrl);

    bot.onText(/\/start/, (msg) => {
      const chatId = msg.chat.id;

      bot.sendMessage(chatId, "Salom! Botga xush kelibsiz 🚀", {
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "📊 Ilovani ochish",
                web_app: { url: appUrl },
              },
            ],
          ],
        },
      });
    });

  } else {
    console.error("❌ TELEGRAM_BOT_TOKEN yoki APP_URL yo‘q!");
  }

  // =======================
  // VITE / EXPRESS
  // =======================
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });

    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");

    app.use(express.static(distPath));

    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Server ishlayapti: http://localhost:${PORT}`);
  });
}

startServer();