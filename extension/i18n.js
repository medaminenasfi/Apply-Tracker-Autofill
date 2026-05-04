/**
 * Extension i18n module
 * Loads translations from _locales/{lang}/messages.json
 * Language preference is stored in chrome.storage.local (synced from frontend)
 */

const EXT_I18N = {
  currentLang: 'en',
  messages: {},
  
  async init() {
    // Get language from storage (synced from frontend localStorage)
    const result = await chrome.storage.local.get(['language']);
    this.currentLang = result.language || 'en';
    
    // Load messages for current language
    await this.loadMessages(this.currentLang);
    
    // Apply translations to the DOM
    this.translatePage();
    
    // Listen for language changes
    chrome.storage.onChanged.addListener((changes, areaName) => {
      if (areaName === 'local' && changes.language) {
        const newLang = changes.language.newValue || 'en';
        if (newLang !== this.currentLang) {
          this.currentLang = newLang;
          this.loadMessages(newLang).then(() => this.translatePage());
        }
      }
    });
  },
  
  async loadMessages(lang) {
    try {
      const url = chrome.runtime.getURL(`_locales/${lang}/messages.json`);
      const response = await fetch(url);
      this.messages = await response.json();
    } catch (e) {
      console.warn(`[EXT i18n] Failed to load ${lang}, falling back to en`);
      try {
        const url = chrome.runtime.getURL('_locales/en/messages.json');
        const response = await fetch(url);
        this.messages = await response.json();
        this.currentLang = 'en';
      } catch (e2) {
        console.error('[EXT i18n] Failed to load fallback messages');
        this.messages = {};
      }
    }
  },
  
  t(key) {
    const entry = this.messages[key];
    return entry ? entry.message : key;
  },
  
  translatePage() {
    // Translate all elements with data-i18n attribute
    document.querySelectorAll('[data-i18n]').forEach((el) => {
      const key = el.getAttribute('data-i18n');
      const translated = this.t(key);
      if (translated && translated !== key) {
        el.textContent = translated;
      }
    });
    
    // Translate placeholders
    document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
      const key = el.getAttribute('data-i18n-placeholder');
      const translated = this.t(key);
      if (translated && translated !== key) {
        el.placeholder = translated;
      }
    });
    
    // Translate titles
    document.querySelectorAll('[data-i18n-title]').forEach((el) => {
      const key = el.getAttribute('data-i18n-title');
      const translated = this.t(key);
      if (translated && translated !== key) {
        el.title = translated;
      }
    });
  },
  
  getLang() {
    return this.currentLang;
  },
  
  async setLang(lang) {
    this.currentLang = lang;
    await chrome.storage.local.set({ language: lang });
    await this.loadMessages(lang);
    this.translatePage();
  }
};
