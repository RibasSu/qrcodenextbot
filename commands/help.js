module.exports = (bot, Markup, i18n, setUserLanguage) => {
    bot.help((ctx) => {
        setUserLanguage(ctx);
        ctx.reply(i18n.t('help_message'), {
            parse_mode: 'HTML',
            /*...Markup.inlineKeyboard([
                [Markup.button.callback(i18n.t('help_btn'), 'callback_help')]
            ])*/
        });
    });
    console.log('Help command loaded');
};
