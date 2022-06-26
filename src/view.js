import onChange from "on-change";

export default (state) => {
  const feedbackEl = document.querySelector('p.feedback');
  const inputEl = document.querySelector('input');

  return onChange(state, (path, value, previousValue) => {
    switch (path) {
      case 'feedbackStatus':
        feedbackEl.textContent = value;
        break;
      case 'isValidForm':
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
