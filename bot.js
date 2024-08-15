const { Telegraf, Markup } = require('telegraf');
require('dotenv').config({ path: './config/.env' });
const { i18n } = require('./config/i18next');
const express = require('express');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const Jimp = require('jimp');
const qrcode = require('qrcode');
const qrcodereader = require('qrcode-reader');

const bot = new Telegraf(process.env.TELEGRAM_TOKEN);
const app = express();

// Função para definir o idioma do usuário
function setUserLanguage(ctx) {
    const userLang = ctx.from.language_code;
    // Define o idioma com base na configuração
    if (userLang === 'pt' || userLang === 'pt-br') {
      i18n.changeLanguage('pt-br');
    } else {
      i18n.changeLanguage('en');
    }
};

// Carregar comandos
const commandsPath = path.join(__dirname, 'commands');
fs.readdirSync(commandsPath).forEach(async (file) => { 
    const command = require(path.join(commandsPath, file));
    command(bot, Markup, i18n, setUserLanguage);
});

// Handler para mensagens de texto
bot.on('text', async (ctx) => {
    setUserLanguage(ctx);
    const text = ctx.message.text;

    try {
        const qrImage = await qrcode.toBuffer(text);
        await ctx.replyWithPhoto(
            { source: qrImage }, 
            { 
                caption: i18n.t('qrcode_message'),
                parse_mode: 'HTML',
                reply_markup: {
                    inline_keyboard: [
                        [
                            {
                                text: i18n.t('qrcode_btn_text'),
                                url: `${process.env.URL_PAGE}/?text=${encodeURIComponent(text)}`
                            }
                        ]
                    ]
                }
            }
        );               
    } catch (erro) {
        console.error('Error generating QR Code:', erro);
        await ctx.reply(i18n.t('error_generate_qrcode'));
    }
});

// Handler para imagens
bot.on('photo', async (ctx) => {
    setUserLanguage(ctx);
    try {
        // Pega a foto com a maior resolução
        const fileId = ctx.message.photo.pop().file_id;

        // Busca a URL do arquivo
        const fileUrl = await ctx.telegram.getFileLink(fileId);

        // Faz download da imagem
        const response = await axios.get(fileUrl, {
            responseType: 'arraybuffer',
            timeout: 10000 // 10 segundos de timeout
        });        
        const buffer = Buffer.from(response.data);

        // Processa a imagem para melhorar a leitura
        const image = await Jimp.read(buffer);
        image
            .greyscale() // Converte para escala de cinza
            .contrast(1) // Aumenta o contraste
            .normalize(); // Normaliza a imagem

        // Ler o QR Code
        const qr = new qrcodereader();
        qr.callback = (err, value) => {
            if (err) {
                ctx.reply(i18n.t('error_read_qrcode'));
            } else {
                ctx.reply(i18n.t('qrcode_content') + value.result);
            }
        };
        qr.decode(image.bitmap);
    } catch (erro) {
        console.error('Error processing image:', erro);
        await ctx.reply(i18n.t('error_processing_qrcode'));
    }
});

// Configura o servidor Express para gerar QR Codes
app.get('/', async (req, res) => {
    const text = req.query.text;

    if (!text) {
        return res.status(400).send('The “text” parameter is required.');
    }

    try {
        // Gera o QR Code como imagem
        const qrImage = await qrcode.toBuffer(text);

        // Define o Content-Type como imagem PNG
        res.setHeader('Content-Type', 'image/png');

        // Envia a imagem do QR Code como resposta
        res.send(qrImage);
    } catch (erro) {
        console.error('Error generating QR Code:', erro);
        res.status(500).send('Error generating QR Code.');
    }
});

// Inicializa o bot e o servidor web
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Express server running on the port ${PORT}`);
});

bot.launch().then(() => {
    console.log('Bot stopped. Press Ctrl-C to quit.');
});

// Graceful stop para o bot
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
