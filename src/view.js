import onChange from "on-change";
import i18next from "i18next";
import resources from './locales/index.js';

export default (state) => {
  const i18n = i18next.createInstance();
  i18n.init({
    lng: 'ru',
    debug: false,
    resources,
  }).then((t) => { t('key'); });

  const feedbackEl = document.querySelector('p.feedback');
  const inputEl = document.querySelector('input');

  return onChange(state, (path, value, previousValue) => {
    switch (path) {
      case 'form.feedbackStatus':
        feedbackEl.textContent = i18n.t(`${path}.${value}`);
        break;
      case 'form.isValidForm':
        const actualHighlight = value === true ? `text-success` : `text-danger`;
        const previousHighlight = previousValue === true ? 'text-success' : 'text-danger';
        feedbackEl.classList.remove(previousHighlight);
        feedbackEl.classList.add(actualHighlight);
        if (value) {
          inputEl.classList.remove('is-invalid');
        } else {
          inputEl.classList.add('is-invalid');
        }
        break;
      default:
        break;
    }
  });
};
