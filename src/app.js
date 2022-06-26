import * as yup from 'yup';

import watcher from './view.js';

const app = () => {
  const state = {
    form: {
      feed: [],
      feedbackStatus: '',
      isValidForm: '',
    },
    currentLng: 'en',
  };
  const watchedState = watcher(state);

  const validateLink = (link) => {
    const links = state.form.feed;
    yup.setLocale({
      mixed: {
        notOneOf: 'notOneOf',
      },
      string: {
        url: 'validationError',
      },
    });
    const schema = yup.string().url().notOneOf(links);
    return schema.validate(link);
  };

  const form = document.querySelector('form');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const url = formData.get('url');
    validateLink(url).then((data) => {
      watchedState.form.feed.push(data);
      watchedState.form.feedbackStatus = 'success';
      watchedState.form.isValidForm = true;
      form.reset();
    }).catch((err) => {
      const [error] = err.errors;
      watchedState.form.feedbackStatus = `failure.${error}`;
      watchedState.form.isValidForm = false;
    });
    console.log(state);
  });
};

export default app;
