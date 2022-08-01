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
            newPost.show = null;
            newPost.viewed = false;
            state.posts = (state.posts).concat([newPost]);
          });
        }));
      Promise.all([promises])
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
          feed.active = null;
          posts.forEach((post) => {
            post.feedId = feedId;
            post.postId = Number(_.uniqueId());
            post.show = null;
            post.viewed = false;
          });

          state.posts = (state.posts).concat(posts);
          state.feeds = (state.feeds).concat(feed);

          state.feedFetchingProcess = 'success';

          state.form.isValid = true;
        })
        .catch((error) => {
          state.errors.push(`${error.message}`);
          state.form.isValid = false;
          state.feedFetchingProcess = 'rejected';
        });
    };

    elements.formEl.addEventListener('submit', (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      const url = formData.get('url');
      addNewRss(url).finally(() => {
        state.feedFetchingProcess = 'awaiting';
      });
    });

    elements.postsListContainer.addEventListener('click', (e) => {
      const { target } = e;
      const link = target.closest('a');
      if (link === target) {
        const id = Number(link.dataset.id);
        state.posts.forEach((post) => {
          if (post.postId === id) {
            post.viewed = true;
          }
        });
      }
    });

    elements.modalWindow.addEventListener('show.bs.modal', (e) => {
      const button = e.relatedTarget;
      const neededPostId = Number(button.dataset.id);
      state.posts.forEach((post) => {
        if (post.postId === neededPostId) {
          post.viewed = true;
        }
      });
      state.modalWindowObject = (state.posts).find((post) => post.postId === neededPostId);
    });

    elements.translationButtons.forEach((button) => button.addEventListener('click', (e) => {
      const targetButton = e.target;
      state.currentLng = targetButton.dataset.lang;
    }));
    // make feeds switchable
    elements.feedsListContainer.addEventListener('click', (e) => {
      const liEl = e.target.closest('li');
      const title = liEl.querySelector('h3');
      const titleText = title.textContent;
      const correspondingFeed = (state.feeds).find((feedItem) => feedItem.feedTitle === titleText);
      const id = correspondingFeed.feedId;
      state.posts.forEach((post) => {
        if (post.feedId === id) {
          post.show = !post.show;
        }
      });
      state.feeds.forEach((feed) => {
        if (feed.feedId === id) {
          feed.active = !feed.active;
        }
      });
    });
    runPostUpdatingProcess();
  });
};
