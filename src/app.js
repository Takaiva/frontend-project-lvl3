import * as yup from 'yup';
import onChange from "on-change";

import downloadRss from './RSSdownloader.js';
import parseRss from './RSSparser.js';
import render from './view.js';

const app = () => {
  const elements = {
    form: document.querySelector('form'),
    fieldset: document.querySelector('form fieldset'),
    input: document.querySelector('form input'),
    button: document.querySelector('form button'),
    feedback: document.querySelector('p.feedback'),
    feedsContainer: document.querySelector('div.feeds'),
    postsContainer: document.querySelector('div.posts'),
  };

  const state = onChange({
    currentLng: 'en',
    urls: [],
    feeds: [],
    posts: [],
    feedFetchingProcess: '', // started, finished
    postsAndFeedsContainersState: 'not rendered', // not rendered, render
    form: {
      feedbackStatus: '',
      isValidForm: '',
    },
  }, render(elements));

  const validateLink = (link) => {
    const links = state.urls;
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

  const startRssSetup = (url) => {
    // disabling form interface while downloading and setting up the rss
    state.feedFetchingProcess = 'started';
    validateLink(url).then((validatedUrl) => {
      downloadRss(validatedUrl).then((response) => {
        parseRss(response.data.contents).then(({ feed, posts }) => {
          // when parsing finished successfully, rendering containers for feed and post items
          if (state.postsAndFeedsContainersState === 'not rendered') {
            state.postsAndFeedsContainersState = 'render';
          }

          // update info about added feeds and posts in state
          state.posts = (state.posts).concat(posts);
          state.feeds = (state.feeds).concat(feed);

          // performing feedback status
          state.form.feedbackStatus = 'success';

          // enable form interface when the rss setting up is finished
          state.feedFetchingProcess = 'finished';

          // update info about added urls
          state.urls.push(url);

          // update feedback highlighting color (red or green) depending on the feedback status
          state.form.isValidForm = !(state.form.feedbackStatus).includes('failure');

          // reset form when rss is downloaded and set up successfully
          elements.form.reset();
        }).catch((err) => {
          const parsingError = err.message;
          state.form.feedbackStatus = `failure.${parsingError}`;
          state.form.isValidForm = !(state.form.feedbackStatus).includes('failure');
          state.feedFetchingProcess = 'finished';
        });
      }).catch((err) => {
        if (err.response) {
          state.form.feedbackStatus = `failure.badResponse`;
        }
        if (err.request) {
          state.form.feedbackStatus = `failure.noResponse`;
        }
        state.form.isValidForm = !(state.form.feedbackStatus).includes('failure');
        state.feedFetchingProcess = 'finished';
      });
    }).catch((err) => {
      const validationError = err.message;
      state.form.feedbackStatus = `failure.${validationError}`;
      state.form.isValidForm = !(state.form.feedbackStatus).includes('failure');
      state.feedFetchingProcess = 'finished';
    });
  };

  elements.form.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const url = formData.get('url');
    startRssSetup(url);
  });
};

export default app;
