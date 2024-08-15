const path = require('path');
const i18n = require('i18next');
const Backend = require('i18next-fs-backend');

// Inicializa o i18next
i18n.use(Backend).init({
  lng: 'en', // Idioma padrão
  fallbackLng: 'en', // Idioma de fallback
  preload: ['en', 'pt-br'], // Idiomas a serem carregados
  ns: ['translation'], // Namespace padrão
  defaultNS: 'translation', // Namespace padrão
  backend: {
    loadPath: path.join(__dirname, '../langs/{{lng}}.json') // Caminho para os arquivos de tradução
  }
}, (err, t) => {
  if (err) {
    console.error('Erro ao carregar o i18next:', err);
  } else {
    console.log('i18next carregado com sucesso.');
  }
});

module.exports.i18n = i18n;
