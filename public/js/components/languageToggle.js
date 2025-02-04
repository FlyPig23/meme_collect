class LanguageToggle {
    constructor() {
        // Default to English if no language is set
        this.currentLang = localStorage.getItem('language') || 'en';
        this.translator = new Translator();
        this.init();
    }

    init() {
        // Always show opposite language on button
        const toggleBtn = document.getElementById('langToggle');
        if (toggleBtn) {
            toggleBtn.textContent = this.currentLang === 'en' ? '中文' : 'English';
        }
        
        // Initialize translations on page load
        this.translator.currentLanguage = this.currentLang;
        this.translator.loadTranslations().then(() => {
            this.translator.updatePageContent();
        });
    }

    async toggle() {
        // Toggle language
        this.currentLang = this.currentLang === 'en' ? 'zh' : 'en';
        localStorage.setItem('language', this.currentLang);
        
        // Update translator's language and content
        this.translator.currentLanguage = this.currentLang;
        await this.translator.loadTranslations();
        await this.translator.updatePageContent();
        
        // Update button text
        const toggleBtn = document.getElementById('langToggle');
        if (toggleBtn) {
            toggleBtn.textContent = this.currentLang === 'en' ? '中文' : 'English';
        }
    }

    updatePlaceholders() {
        // Update placeholders for inputs and textareas
        document.querySelectorAll('input[placeholder], textarea[placeholder]').forEach(async element => {
            const placeholderKey = element.getAttribute('data-translate-placeholder');
            if (placeholderKey) {
                const translation = await this.translator.translateText(placeholderKey);
                element.placeholder = translation;
            }
        });

        // Update select default options
        document.querySelectorAll('select').forEach(async select => {
            const firstOption = select.querySelector('option[value=""]');
            if (firstOption) {
                const placeholderKey = firstOption.getAttribute('data-translate-placeholder');
                if (placeholderKey) {
                    const translation = await this.translator.translateText(placeholderKey);
                    firstOption.textContent = translation;
                }
            }
        });
    }
} 