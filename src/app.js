import _ from 'lodash';
import * as yup from 'yup';
import onChange from 'on-change';
import axios from 'axios';

import i18next from 'i18next';
import render from './view.js';
import makeSwitchable from './switch.js';
import parseRss from './RSSparser.js';
import resources from './locales/index.js';

export default () => {
  const i18n = i18next.createInstance();
  i18n.init({
    lng: 'ru',
    debug: false,
    resources,
  }).then((t) => { t('key'); }).then(() => {
    const defaultLanguage = 'ru';
    const elements = {
      formEl: document.querySelector('form'),
      fieldset: document.querySelector('form fieldset'),
      input: document.getElementById('url-input'),
      button: document.querySelector('form button'),
      feedback: document.querySelector('p.feedback'),
      feedsListContainer: document.querySelector('div.feeds ul.list-group'),
      postsListContainer: document.querySelector('div.posts ul.list-group'),
      feedsCardTitle: document.querySelector('.feeds .card-title'),
      postsCardTitle: document.querySelector('.posts .card-title'),
      modalWindow: document.getElementById('modal'),
      translationButtons: document.querySelectorAll('.translation'),
    };

    const initialState = {
      currentLng: defaultLanguage, // en, ru
      feeds: [],
      posts: [],
      feedFetchingProcess: null, // started, finished
      form: {
        feedbackStatus: null, // success/failure.{error}
        isValid: null, // false, true
      },
      modalWindowObject: null,
    };

    const state = onChange(initialState, render(elements, i18n, initialState));


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

    const downloadRss = (url) => axios.get(`https://allorigins.hexlet.app/get?disableCache=true&url=${encodeURIComponent(url)}`);

    const updatePosts = () => {
      const promises = state.feeds.forEach((feed) => {
        downloadRss(feed.feedOriginLink)
          .then((response) => {
            const { posts } = parseRss(response.data.contents);
            const updatedPosts = posts;
            const oldPostTitles = state.posts.map((post) => post.postTitle);
            const allNewPostTitles = updatedPosts.map((post) => post.postTitle);
            const newPostsTitles = _.differenceWith(allNewPostTitles, oldPostTitles, _.isEqual);
            newPostsTitles.forEach((title) => {
              const newPost = updatedPosts.find((post) => post.postTitle === title);
              newPost.feedId = feed.feedId;
              newPost.postId = Number(_.uniqueId());
              newPost.show = null;
              newPost.viewed = false;
              state.posts = (state.posts).concat([newPost]);
            });
          });
      });
      return Promise.all([promises]);
    };

    const runPostUpdatingProcess = () => {
      const period = 5000;
      updatePosts()
        .then(() => setTimeout(() => runPostUpdatingProcess(), period));
    };

    const addNewRss1 = (url) => {
      state.feedFetchingProcess = 'started';
      return validateLink(url)
        .then((validatedUrl) => downloadRss(validatedUrl))
        .then((response) => {
          const { feed, posts } = parseRss(response.data.contents, url);
          const feedId = Number(_.uniqueId());
          feed.feedId = feedId;
          posts.forEach((post) => {
            post.feedId = feedId;
            post.postId = Number(_.uniqueId());
            post.show = null;
            post.viewed = false;
          });

/*          if (state.postsAndFeedsContainersState === 'not rendered') {
            state.postsAndFeedsContainersState = 'render';
          }*/

          // update info about added feeds and posts in state
          state.posts = (state.posts).concat(posts);
          state.feeds = (state.feeds).concat(feed);

          // display success message
          state.form.feedbackStatus = 'success';

          // update feedback highlighting color and input border color
          state.form.isValid = true;

          // add switching between specified posts
          const feedElements = document.querySelectorAll('.feeds ul li');
          const lastAddedFeedElement = feedElements[feedElements.length - 1];
          makeSwitchable(state, lastAddedFeedElement);
        })
        .catch((error) => {
          if (error.response) {
            state.form.feedbackStatus = 'failure.badResponse';
          }
          if (error.request) {
            state.form.feedbackStatus = 'failure.noResponse';
          } else {
            const errorMessage = error.message;
            state.form.feedbackStatus = `failure.${errorMessage}`;
          }
          state.form.isValid = false;
        });
    };

    elements.formEl.addEventListener('submit', (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      const url = formData.get('url');
      addNewRss1(url).finally(() => {
        state.feedFetchingProcess = 'finished';
      });
    });

    elements.modalWindow.addEventListener('show.bs.modal', (e) => {
      const button = e.relatedTarget;
      const neededPostId = Number(button.dataset.id);
      const neededPost = (state.posts).find((post) => post.postId === neededPostId);
      neededPost.viewed = true;
      state.modalWindowObject = neededPost;
    });

    // translate interface into ru or en
    elements.translationButtons.forEach((button) => button.addEventListener('click', (e) => {
      const targetButton = e.target;
      state.currentLng = targetButton.dataset.lang;
    }));
    runPostUpdatingProcess();
  });
};
