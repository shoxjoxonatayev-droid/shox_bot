import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import TelegramBot from "node-telegram-bot-api";
import dotenv from "dotenv";

dotenv.config();

const token = process.env.TELEGRAM_BOT_TOKEN || "";
const appUrl = process.env.APP_URL || "";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Telegram Bot sozlamalari
  if (token) {
    const bot = new TelegramBot(token, { polling: true });

    console.log("Telegram bot sozlamalari yuklanmoqda...");
    console.log(`Bot ishlayotgan APP_URL: ${appUrl}`);

    bot.onText(/\/start/, (msg) => {
      const chatId = msg.chat.id;
      bot.sendMessage(chatId, "Salom! Finance Pro botiga xush kelibsiz. Hisoblarni yuritish uchun quyidagi tugmani bosing:", {
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "Ilovani ochish",
                web_app: { url: appUrl }
              }
            ]
          ]
        }
      });
    });

    console.log("Telegram bot ishga tushdi...");
  }

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
