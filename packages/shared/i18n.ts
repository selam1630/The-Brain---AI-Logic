/**
 * i18n Configuration
 * Internationalization settings and language support
 */

export type Language = 'en' | 'es' | 'fr' | 'de' | 'pt' | 'zh' | 'ja' | 'am';

export const SUPPORTED_LANGUAGES: Record<Language, string> = {
  en: 'English',
  es: 'Español',
  fr: 'Français',
  de: 'Deutsch',
  pt: 'Português',
  zh: '中文',
  ja: '日本語',
  am: 'አማርኛ',
};

export const DEFAULT_LANGUAGE: Language = 'en';

export const i18nConfig = {
  defaultLanguage: DEFAULT_LANGUAGE,
  supportedLanguages: Object.keys(SUPPORTED_LANGUAGES) as Language[],
  fallbackLanguage: DEFAULT_LANGUAGE,
};

/**
 * Example translations object
 * In production, this would be loaded from external files
 */
export const translations: Record<Language, Record<string, string>> = {
  en: {
    'app.title': 'The Brain - AI & Logic',
    'app.description': 'Speech-to-Text and AI Logic Platform',
    'nav.home': 'Home',
    'nav.about': 'About',
    'nav.docs': 'Documentation',
    'button.start': 'Get Started',
    'button.record': 'Start Recording',
    'button.stop': 'Stop Recording',
  },
  es: {
    'app.title': 'The Brain - IA y Lógica',
    'app.description': 'Plataforma de Conversión de Voz a Texto e IA',
    'nav.home': 'Inicio',
    'nav.about': 'Acerca de',
    'nav.docs': 'Documentación',
    'button.start': 'Comenzar',
    'button.record': 'Iniciar Grabación',
    'button.stop': 'Detener Grabación',
  },
  fr: {
    'app.title': 'The Brain - IA et Logique',
    'app.description': 'Plateforme de Reconnaissance Vocale et IA',
    'nav.home': 'Accueil',
    'nav.about': 'À propos',
    'nav.docs': 'Documentation',
    'button.start': 'Commencer',
    'button.record': 'Commencer l\'Enregistrement',
    'button.stop': 'Arrêter l\'Enregistrement',
  },
  de: {
    'app.title': 'The Brain - KI & Logik',
    'app.description': 'Sprache-zu-Text- und KI-Logik-Plattform',
    'nav.home': 'Startseite',
    'nav.about': 'Über uns',
    'nav.docs': 'Dokumentation',
    'button.start': 'Anfangen',
    'button.record': 'Aufnahme starten',
    'button.stop': 'Aufnahme beenden',
  },
  pt: {
    'app.title': 'The Brain - IA e Lógica',
    'app.description': 'Plataforma de Reconhecimento de Voz e IA',
    'nav.home': 'Início',
    'nav.about': 'Sobre',
    'nav.docs': 'Documentação',
    'button.start': 'Começar',
    'button.record': 'Iniciar Gravação',
    'button.stop': 'Parar Gravação',
  },
  zh: {
    'app.title': '大脑 - AI和逻辑',
    'app.description': '语音文字和人工智能逻辑平台',
    'nav.home': '首页',
    'nav.about': '关于',
    'nav.docs': '文档',
    'button.start': '开始',
    'button.record': '开始录音',
    'button.stop': '停止录音',
  },
  ja: {
    'app.title': 'ザ・ブレイン - AI&ロジック',
    'app.description': '音声テキスト変換およびAIロジックプラットフォーム',
    'nav.home': 'ホーム',
    'nav.about': 'について',
    'nav.docs': 'ドキュメント',
    'button.start': '開始する',
    'button.record': '録音を開始',
    'button.stop': '録音を停止',
  },
  am: {
    'app.title': 'ሳሞና - AI እና ሎጂክ',
    'app.description': 'ድምጽ ወደ ጽሑፍ እና AI ሎጂክ መድረክ',
    'nav.home': 'መነሻ',
    'nav.about': 'ስለ ኛ',
    'nav.docs': 'ሰነዶች',
    'button.start': 'ከመጀመር',
    'button.record': '녹음 ጀምር',
    'button.stop': '녹음 ዖም',
  },
};

/**
 * Get translation string
 * @param language - Target language
 * @param key - Translation key
 * @param defaultValue - Fallback value
 * @returns Translated string
 */
export function getTranslation(
  language: Language,
  key: string,
  defaultValue?: string,
): string {
  const lang = translations[language];
  if (!lang) {
    return defaultValue || key;
  }
  return lang[key] || defaultValue || key;
}
