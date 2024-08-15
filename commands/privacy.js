module.exports = (bot, Markup, i18n, setUserLanguage) => {
    bot.command('privacy', (ctx) => {
        setUserLanguage(ctx);
        ctx.reply(i18n.t('privacy_message'), {
            parse_mode: 'HTML',
            ...Markup.inlineKeyboard([
                [Markup.button.url(i18n.t('privacy_btn'), i18n.t('privacy_link'))]
            ])
        });
    });
    console.log('Privacy command loaded');
}