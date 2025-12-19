import QRCode from "qrcode";
import { decode } from "@paulmillr/qr";
import { getTranslation, getUserLanguage } from "./i18n.js";
import {
  handleStart,
  handleHelp,
  handlePrivacy,
  handleDev,
} from "./commands.js";

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // Endpoint para gerar QR Code via URL (página web)
    if (url.pathname === "/" && request.method === "GET") {
      const text = url.searchParams.get("text");

      if (!text) {
        return new Response('The "text" parameter is required.', {
          status: 400,
        });
      }

      try {
        const qrImage = await QRCode.toBuffer(text);
        return new Response(qrImage, {
          headers: {
            "Content-Type": "image/png",
            "Cache-Control": "public, max-age=3600",
          },
        });
      } catch (error) {
        console.error("Error generating QR Code:", error);
        return new Response("Error generating QR Code.", { status: 500 });
      }
    }

    // Webhook do Telegram
    if (url.pathname === "/webhook" && request.method === "POST") {
      try {
        const update = await request.json();
        await handleTelegramUpdate(update, env);
        return new Response("OK", { status: 200 });
      } catch (error) {
        console.error("Error processing webhook:", error);
        return new Response("Error", { status: 500 });
      }
    }

    // Endpoint para configurar webhook
    if (url.pathname === "/setWebhook" && request.method === "GET") {
      const webhookUrl = `${url.origin}/webhook`;
      const telegramUrl = `https://api.telegram.org/bot${env.TELEGRAM_TOKEN}/setWebhook?url=${webhookUrl}`;

      const response = await fetch(telegramUrl);
      const data = await response.json();

      return new Response(JSON.stringify(data), {
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response("QR Code Bot - Cloudflare Workers", { status: 200 });
  },
};

async function handleTelegramUpdate(update, env) {
  // Ignora updates sem mensagem
  if (!update.message) return;

  const message = update.message;
  const chatId = message.chat.id;
  const lang = getUserLanguage(update);

  // Comandos
  if (message.text) {
    const text = message.text.trim();

    if (text === "/start") {
      await handleStart(update, env);
      return;
    }

    if (text === "/help") {
      await handleHelp(update, env);
      return;
    }

    if (text === "/privacy") {
      await handlePrivacy(update, env);
      return;
    }

    if (text === "/dev") {
      await handleDev(update, env);
      return;
    }

    // Gerar QR Code do texto
    await handleTextMessage(message, env, lang);
    return;
  }

  // Processar foto (QR Code)
  if (message.photo) {
    await handlePhotoMessage(message, env, lang);
    return;
  }
}

async function handleTextMessage(message, env, lang) {
  const chatId = message.chat.id;
  const text = message.text;

  try {
    const qrImage = await QRCode.toBuffer(text);
    const qrBase64 = Buffer.from(qrImage).toString("base64");

    const caption = getTranslation(lang, "qrcode_message");
    const btnText = getTranslation(lang, "qrcode_btn_text");
    const pageUrl = env.URL_PAGE || "https://your-worker.workers.dev";

    await sendPhoto(env.TELEGRAM_TOKEN, chatId, qrBase64, {
      caption: caption,
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: btnText,
              url: `${pageUrl}/?text=${encodeURIComponent(text)}`,
            },
          ],
        ],
      },
    });
  } catch (error) {
    console.error("Error generating QR Code:", error);
    const errorMsg = getTranslation(lang, "error_generate_qrcode");
    await sendMessage(env.TELEGRAM_TOKEN, chatId, errorMsg);
  }
}

async function handlePhotoMessage(message, env, lang) {
  const chatId = message.chat.id;

  try {
    // Pega a foto com maior resolução
    const photo = message.photo[message.photo.length - 1];
    const fileId = photo.file_id;

    // Busca informações do arquivo
    const fileUrl = await getFileLink(env.TELEGRAM_TOKEN, fileId);

    // Download da imagem
    const response = await fetch(fileUrl);
    const imageBuffer = await response.arrayBuffer();

    // Tenta decodificar o QR Code
    const uint8Array = new Uint8Array(imageBuffer);

    try {
      // Usando @paulmillr/qr que funciona no Workers
      const decoded = decode(uint8Array);

      if (decoded && decoded.data) {
        const content = getTranslation(lang, "qrcode_content");
        await sendMessage(env.TELEGRAM_TOKEN, chatId, content + decoded.data);
      } else {
        const errorMsg = getTranslation(lang, "error_read_qrcode");
        await sendMessage(env.TELEGRAM_TOKEN, chatId, errorMsg);
      }
    } catch (decodeError) {
      console.error("Error decoding QR:", decodeError);
      const errorMsg = getTranslation(lang, "error_read_qrcode");
      await sendMessage(env.TELEGRAM_TOKEN, chatId, errorMsg);
    }
  } catch (error) {
    console.error("Error processing photo:", error);
    const errorMsg = getTranslation(lang, "error_processing_qrcode");
    await sendMessage(env.TELEGRAM_TOKEN, chatId, errorMsg);
  }
}

// Funções auxiliares da API do Telegram
async function sendMessage(token, chatId, text, options = {}) {
  const url = `https://api.telegram.org/bot${token}/sendMessage`;

  const body = {
    chat_id: chatId,
    text: text,
    ...options,
  };

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  return response.json();
}

async function sendPhoto(token, chatId, photoBase64, options = {}) {
  const url = `https://api.telegram.org/bot${token}/sendPhoto`;

  const body = {
    chat_id: chatId,
    photo: `data:image/png;base64,${photoBase64}`,
    ...options,
  };

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  return response.json();
}

async function getFileLink(token, fileId) {
  const url = `https://api.telegram.org/bot${token}/getFile?file_id=${fileId}`;
  const response = await fetch(url);
  const data = await response.json();

  if (data.ok) {
    return `https://api.telegram.org/file/bot${token}/${data.result.file_path}`;
  }

  throw new Error("Failed to get file link");
}
