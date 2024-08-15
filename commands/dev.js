module.exports = (bot, Markup, i18n, setUserLanguage) => {
    bot.command('dev', (ctx) => {
        setUserLanguage(ctx);
        ctx.reply(i18n.t('dev_message'), {
            parse_mode: 'HTML',
            ...Markup.inlineKeyboard([
                [Markup.button.url(i18n.t('dev_btn'), i18n.t('dev_link'))]
            ])
        });
    });
    console.log('Dev command loaded');
}