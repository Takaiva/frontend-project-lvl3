import * as yup from 'yup';
import onChange from 'on-change';

import downloadRss from './RSSdownloader.js';
import parseRss from './RSSparser.js';
import render from './view.js';
import updatePosts from './updatePosts.js';

const app = () => {
  const defaultLanguage = 'ru';
  const elements = {
    formEl: document.querySelector('form'),
    fieldset: document.querySelector('form fieldset'),
    input: document.getElementById('url-input'),
    button: document.querySelector('form button'),
    feedback: document.querySelector('p.feedback'),
    feedsContainer: document.querySelector('div.feeds'),
    postsContainer: document.querySelector('div.posts'),
    modalWindow: document.getElementById('modal'),
    translationButtons: document.querySelectorAll('.translation'),
  };

  const state = onChange({
    currentLng: defaultLanguage, // en, ru
    feeds: [],
    posts: [],
    updatingProcess: null, // started, null
    feedFetchingProcess: null, // started, finished
    postsAndFeedsContainersState: 'not rendered', // not rendered, render
    form: {
      feedbackStatus: null, // success/failure.{error}
      isValidForm: null, // true/false
    },
    modalWindowObject: null,
  }, render(elements, defaultLanguage));

  const validateLink = (link) => {
    const links = state.feeds.map((feed) => feed.feedOriginLink);
    yup.setLocale({
      mixed: {
        notOneOf: 'notOneOf',
      },
      string: {
        url: 'validationError',
        min: 'isEmpty',
      },
    });
    const schema = yup.string().url().min(1).notOneOf(links);
    return schema.validate(link);
  };

  const runPostUpdatingProcess = () => {
    const period = 5000;
    updatePosts(state);
    setTimeout(() => runPostUpdatingProcess(), period);
  };

  const startRssSetup = (url) => {
    // disabling form interface while downloading and setting up the rss
    state.feedFetchingProcess = 'started';
    validateLink(url).then((validatedUrl) => {
      downloadRss(validatedUrl).then((response) => {
        parseRss(response.data.contents, url, state).then(({ feed, posts }) => {
          // when parsing finished successfully, if needed containers are not rendered,
          // render containers for feed and post items
          if (state.postsAndFeedsContainersState === 'not rendered') {
            state.postsAndFeedsContainersState = 'render';
          }

          // update info about added feeds and posts in state
          state.posts = (state.posts).concat(posts);
          state.feeds = (state.feeds).concat(feed);

          // display success message
          state.form.feedbackStatus = 'success';

          // enable form interface when the rss setting up is finished
          state.feedFetchingProcess = 'finished';

          // update feedback highlighting color (red or green) depending on the feedback status
          state.form.isValidForm = !(state.form.feedbackStatus).includes('failure');

          // reset form when rss is downloaded and set up successfully
          elements.formEl.reset();

          // user-friendly practice
          elements.input.focus();

          // start updating posts process
          // using state to not to trigger updating more that one times
          if (state.updatingProcess !== 'started') {
            runPostUpdatingProcess();
            state.updatingProcess = 'started';
          }
        }).catch((parsingError) => {
          // display error message
          const errorMessage = parsingError.message;
          state.form.feedbackStatus = `failure.${errorMessage}`;
          state.form.isValidForm = !(state.form.feedbackStatus).includes('failure');
          state.feedFetchingProcess = 'finished';
        });
      }).catch((networkError) => {
        // display error message
        if (networkError.response) {
          state.form.feedbackStatus = 'failure.badResponse';
        }
        if (networkError.request) {
          state.form.feedbackStatus = 'failure.noResponse';
        }
        state.form.isValidForm = !(state.form.feedbackStatus).includes('failure');
        state.feedFetchingProcess = 'finished';
      });
    }).catch((validationError) => {
      // display error message
      const errorMessage = validationError.message;
      state.form.feedbackStatus = `failure.${errorMessage}`;
      state.form.isValidForm = !(state.form.feedbackStatus).includes('failure');
      state.feedFetchingProcess = 'finished';
    });
  };

  elements.formEl.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const url = formData.get('url');
    startRssSetup(url);
  });

  elements.modalWindow.addEventListener('show.bs.modal', (e) => {
    const button = e.relatedTarget;
    const neededPostId = Number(button.dataset.id);
    const posts = state.posts.map((post) => post);
    const neededPost = posts.find((post) => post.postId === neededPostId);
    neededPost.viewed = true;
    state.modalWindowObject = neededPost;
  });

  // translate interface into ru or en
  elements.translationButtons.forEach((button) => button.addEventListener('click', (e) => {
    const targetButton = e.target;
    const language = targetButton.dataset.lang;
    state.currentLng = language;
  }));
};

export default app;
