import { getTranslation, getUserLanguage } from "./i18n.js";

export async function handleStart(update, env) {
  const chatId = update.message.chat.id;
  const lang = getUserLanguage(update);

  const message = getTranslation(lang, "start_message");

  await sendMessage(env.TELEGRAM_TOKEN, chatId, message, {
    parse_mode: "HTML",
  });
}

export async function handleHelp(update, env) {
  const chatId = update.message.chat.id;
  const lang = getUserLanguage(update);

  const message = getTranslation(lang, "help_message");

  await sendMessage(env.TELEGRAM_TOKEN, chatId, message, {
    parse_mode: "HTML",
  });
}

export async function handlePrivacy(update, env) {
  const chatId = update.message.chat.id;
  const lang = getUserLanguage(update);

  const message = getTranslation(lang, "privacy_message");
  const btnText = getTranslation(lang, "privacy_btn");
  const link = getTranslation(lang, "privacy_link");

  await sendMessage(env.TELEGRAM_TOKEN, chatId, message, {
    parse_mode: "HTML",
    reply_markup: {
      inline_keyboard: [[{ text: btnText, url: link }]],
    },
  });
}

export async function handleDev(update, env) {
  const chatId = update.message.chat.id;
  const lang = getUserLanguage(update);

  const message = getTranslation(lang, "dev_message");
  const btnText = getTranslation(lang, "dev_btn");
  const link = getTranslation(lang, "dev_link");

  await sendMessage(env.TELEGRAM_TOKEN, chatId, message, {
    parse_mode: "HTML",
    reply_markup: {
      inline_keyboard: [[{ text: btnText, url: link }]],
    },
  });
}

// Função auxiliar para enviar mensagens
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
