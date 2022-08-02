import _ from 'lodash';
import * as yup from 'yup';
import onChange from 'on-change';
import axios from 'axios';

import i18next from 'i18next';
import render from './view.js';
import parseRss from './RSSparser.js';
import resources from './locales/index.js';

export default () => {
  const i18n = i18next.createInstance();
  i18n.init({
    lng: 'ru',
    debug: false,
    resources,
  }).then(() => {
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
      feedFetchingProcess: 'awaiting', // awaiting, started, success, rejected
      form: {
        isValid: null, // false, true
      },
      feeds: [],
      uiState: {
        feeds: [], // {feedId: '', displaySeparately: true/false}
        posts: [], // {postId: '', viewed: true/false}
      },
      posts: [],
      errors: [],
      modalWindowObject: null,
    };

    const state = onChange(initialState, render(elements, i18n, initialState));

    // downloader
    const downloadRss = (url) => axios.get(`https://allorigins.hexlet.app/get?disableCache=true&url=${encodeURIComponent(url)}`);
    // validator
    const validateLink = (link) => {
      const links = state.feeds.map((feed) => feed.feedOriginLink);
      const schema = yup.string().url().min(1).notOneOf(links);
      return schema.validate(link);
    };
    // set custom validation errors
    yup.setLocale({
      mixed: {
        notOneOf: 'notOneOf',
      },
      string: {
        url: 'validationError',
        min: 'isEmpty',
      },
    });
    // updater
    const runPostUpdatingProcess = () => {
      const period = 5000;
      const promises = state.feeds.map((feed) => downloadRss(feed.feedOriginLink)
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
            state.posts = (state.posts).concat([newPost]);
            const { displaySeparately } = state.uiState.feeds
              .find((uiFeed) => uiFeed.feedId === newPost.feedId);
            state.uiState.posts.push({
              feedId: newPost.feedId,
              postId: newPost.postId,
              viewed: false,
              show: displaySeparately,
            });
          });
        }));
      Promise.all(promises)
        .then(() => setTimeout(() => runPostUpdatingProcess(), period));
    };

    const addNewRss = (url) => {
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
          });
          // store feeds and posts
          state.feeds = (state.feeds).concat(feed);
          state.posts = (state.posts).concat(posts);

          const uiPosts = posts.reduce((acc, { postId }) => {
            acc.push({
              feedId, postId, viewed: false, show: null,
            });
            return acc;
          }, []);
          const uiFeed = { feedId, displaySeparately: false };
          // store uiStates of feeds and posts
          state.uiState.feeds = (state.uiState.feeds).concat(uiFeed);
          state.uiState.posts = (state.uiState.posts).concat(uiPosts);

          state.feedFetchingProcess = 'success';

          state.form.isValid = true;
        })
        .catch((error) => {
          state.errors.push(`${error.message}`);
          state.form.isValid = false;
          state.feedFetchingProcess = 'rejected';
        });
    };
    // rss adding event
    elements.formEl.addEventListener('submit', (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      const url = formData.get('url');
      addNewRss(url).finally(() => {
        state.feedFetchingProcess = 'awaiting';
      });
    });
    // change posts uiState
    elements.postsListContainer.addEventListener('click', (e) => {
      const { target } = e;
      const link = target.closest('a');
      if (link === target) {
        const id = Number(link.dataset.id);
        state.uiState.posts.forEach((uiPost) => {
          if (uiPost.postId === id) {
            uiPost.viewed = true;
          }
        });
      }
    });
    // store object for modal window
    elements.modalWindow.addEventListener('show.bs.modal', (e) => {
      const button = e.relatedTarget;
      const neededPostId = Number(button.dataset.id);
      state.uiState.posts.forEach((uiPost) => {
        if (uiPost.postId === neededPostId) {
          uiPost.viewed = true;
        }
      });
      state.modalWindowObject = (state.posts).find((post) => post.postId === neededPostId);
    });
    // change app language state
    elements.translationButtons.forEach((button) => button.addEventListener('click', (e) => {
      const targetButton = e.target;
      state.currentLng = targetButton.dataset.lang;
    }));
    // make feeds switchable,
    // change feeds display uiState,
    // change posts show uiState
    elements.feedsListContainer.addEventListener('click', (e) => {
      const liEl = e.target.closest('li');
      const id = Number(liEl.dataset.id);
      state.uiState.feeds.forEach((uiFeed) => {
        if (uiFeed.feedId === id) {
          uiFeed.displaySeparately = !uiFeed.displaySeparately;
        }
      });
      state.uiState.posts.forEach((uiPost) => {
        if (uiPost.feedId === id) {
          uiPost.show = !uiPost.show;
        }
      });
    });
    runPostUpdatingProcess();
  });
};
