let languageData = {};
async function loadLanguage(lang = 'zh_cn') {
    try {
        const response = await fetch(`assets/lang/${lang}.json`);
        languageData = await response.json();
        applyLanguage();
    } catch (error) {
        displayError(`load language file error: ${error.message}`);
    }
}
function applyLanguage() {
    const elements = document.querySelectorAll('[data-lang]');
    elements.forEach(element => {
        const key = element.getAttribute('data-lang');
        if (languageData[key]) {
            if (element.tagName === 'INPUT' && element.hasAttribute('placeholder')) {
                element.placeholder = languageData[key];
            } else {
                element.innerHTML = languageData[key];
            }
        }
    });
    const dynamicElements = document.querySelectorAll('[data-lang-dynamic]');
    dynamicElements.forEach(element => {
        const key = element.getAttribute('data-lang-dynamic');
        if (languageData[key]) {
            element.setAttribute('data-lang-template', languageData[key]);
        }
    });
    const selectOptions = document.querySelectorAll('#language-select option');
    selectOptions.forEach(option => {
        const key = option.getAttribute('data-lang');
        if (languageData[key]) {
            option.innerText = languageData[key];
        }
    });
}
function updateDynamicText(elementId, ...args) {
    const element = document.getElementById(elementId);
    if (element && element.hasAttribute('data-lang-template')) {
        let template = element.getAttribute('data-lang-template');
        args.forEach((arg, index) => {
            template = template.replace(`{${index}}`, arg);
        });
        element.innerHTML = template;
    }
}
document.addEventListener('DOMContentLoaded', () => {
    loadLanguage('zh_cn');
    const languageSelect = document.getElementById('language-select');
    if (languageSelect) {
        languageSelect.addEventListener('change', (event) => {
            loadLanguage(event.target.value);
        });
    }
});
window.updateDynamicText = updateDynamicText;
window.loadLanguage = loadLanguage;
