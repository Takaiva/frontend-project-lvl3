import * as yup from 'yup';

import watcher from './view.js';

const app = () => {
  const state = {
    feed: [],
    feedbackStatus: '',
    isValidForm: '',
  };

  const validateLink = (link) => {
    const links = state.feed;
    yup.setLocale({
      mixed: {
        notOneOf: 'Provided RSS already exists',
      },
      string: {
        url: 'Invalid url',
      },
    });
    const schema = yup.string().url().notOneOf(links);
    return schema.validate(link);
  };

  const watchedState = watcher(state);

  const form = document.querySelector('form');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const url = formData.get('url');
    validateLink(url).then((data) => {
      watchedState.feed.push(data);
      watchedState.feedbackStatus = 'RSS successfully uploaded';
      watchedState.isValidForm = true;
      form.reset();
    }).catch((err) => {
      const [error] = err.errors;
      watchedState.feedbackStatus = error;
      watchedState.isValidForm = false;
    });
    console.log(state);
  });
};

export default app;
