function detectLanguage(text) {
  return /[\u0600-\u06FF]/.test(text) ? 'ar' : 'fr'
}

function bilingual(value) {
  if (!value || value.trim() === '') return { fr: null, ar: null }
  const lang = detectLanguage(value)
  return {
    fr: lang === 'fr' ? value.trim() : null,
    ar: lang === 'ar' ? value.trim() : null,
  }
}

module.exports = { detectLanguage, bilingual }