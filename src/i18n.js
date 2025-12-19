// Traduções inline para Cloudflare Workers (sem filesystem)
const translations = {
  "pt-br": {
    start_message:
      "Bem-vindo(a)!\nCom este bot você pode ler e gerar QR Codes. Envie-me um texto, vou convertê-lo em QR Code!",
    help_message:
      "Como usar o bot:\n\n• <b>Envie um texto:</b> Basta enviar uma mensagem de texto e o bot irá gerar um QR Code com o conteúdo fornecido.\n• <b>Envie uma foto:</b> Se enviar uma foto contendo um QR Code, o bot irá ler o QR Code da imagem e retornar o conteúdo que está codificado nele.\n\nNão há comandos específicos. Apenas envie o texto ou a foto que deseja transformar em um QR Code.",
    privacy_message: "Este bot não armazena nenhum dado do usuário.",
    privacy_btn: "Política de Privacidade da Likn",
    privacy_link: "https://privacy.likn.com.br/qrcodenextbot/privacy",
    dev_message: "Desenvolvido por @RibasSu.",
    dev_btn: "Likn & Co.",
    dev_link: "https://likn.com.br/",
    qrcode_message: "Aqui está seu QR Code!",
    qrcode_btn_text: "Link do QR Code",
    error_generate_qrcode: "Desculpe, ocorreu um erro ao gerar o QR Code.",
    error_read_qrcode:
      "Não consegui ler o QR Code na imagem. Tente enviar uma imagem mais clara.",
    error_processing_qrcode:
      "Ocorreu um erro ao tentar ler o QR Code da imagem.",
    qrcode_content: "O QR Code contém: ",
  },
  en: {
    start_message:
      "Welcome!\nWith this bot, you can read and generate QR Codes. Send me a text, and I will convert it into a QR Code!",
    help_message:
      "How to use the bot:\n\n• <b>Send a text:</b> Just send a text message, and the bot will generate a QR Code with the provided content.\n• <b>Send a photo:</b> If you send a photo containing a QR Code, the bot will read the QR Code from the image and return the content encoded in it.\n\nThere are no specific commands. Just send the text or the photo you want to convert into a QR Code.",
    privacy_message: "This bot does not store any user data.",
    privacy_btn: "Likn Privacy Policy",
    privacy_link: "https://privacy.likn.com.br/qrcodenextbot/privacy",
    dev_message: "Developed by @RibasSu.",
    dev_btn: "Likn & Co.",
    dev_link: "https://likn.com.br/",
    qrcode_message: "Here is your QR Code!",
    qrcode_btn_text: "QR Code Link",
    error_generate_qrcode: "Sorry, there was an error generating the QR Code.",
    error_read_qrcode:
      "I couldn't read the QR Code in the image. Please try sending a clearer image.",
    error_processing_qrcode:
      "There was an error trying to read the QR Code from the image.",
    qrcode_content: "The QR Code contains: ",
  },
};

// Sistema simples de i18n para Workers
export function getTranslation(lang, key) {
  const langCode = lang === "pt" || lang === "pt-br" ? "pt-br" : "en";
  return translations[langCode][key] || key;
}

export function getUserLanguage(update) {
  const userLang = update.message?.from?.language_code || "en";
  return userLang === "pt" || userLang === "pt-br" ? "pt-br" : "en";
}
