import i18next from "i18next";
import resources from './locales/index.js';
import renderPostsAndFeedsContainers from "./renders/renderPostsFeedsContainers.js";
import renderFeed from "./renders/renderFeed.js";
import renderPosts from "./renders/renderPosts.js";

export default (elements) => (path, value, previousValue) => {
  const defaultLanguage = 'en';
  const translation = i18next.createInstance();
  translation.init({
    lng: defaultLanguage,
    debug: false,
    resources,
  }).then((t) => { t('key'); });

  const {
    feedback, input, fieldset, feedsContainer, postsContainer,
  } = elements;

  switch (path) {
    case 'feedFetchingProcess':
      //disable interface
      if (value === 'started') {
        fieldset.setAttribute('disabled', '');
      }
      //enable interface
      if (value === 'finished') {
        fieldset.removeAttribute('disabled');
      }
      break;
    case 'postsAndFeedsContainersState':
      if (value === 'render') {
        // when the first rss successfully downloaded, render templates for feeds and posts containers
        renderPostsAndFeedsContainers(feedsContainer, postsContainer);
      }
      break;
    case 'feeds':
      // render last added feed item
      const feedItemsContainer = document.querySelector('div.feeds ul.list-group');
      const lastAddedFeedItem = (value[value.length - 1]);
      const { feedTitle, feedDescription } = lastAddedFeedItem;
      const renderedFeedElement = renderFeed(feedTitle, feedDescription);
      feedItemsContainer.prepend(renderedFeedElement);
      break;
    case 'posts':
      // render last added post items
      const postItemsContainer = document.querySelector('div.posts ul.list-group');
      const previouslyAddedPostItems = previousValue;
      const lengthOfPreviouslyAddedPostItems = previouslyAddedPostItems.length;
      const allCurrentAddedPostItems = value;
      const lastAddedPostItems = allCurrentAddedPostItems.slice(lengthOfPreviouslyAddedPostItems);
      const renderedPostElements = lastAddedPostItems.map(({
        postTitle, postLink, postId, feedId,
      }) => renderPosts(postTitle, postLink, postId, feedId)).reverse();
      renderedPostElements.forEach((el) => postItemsContainer.prepend(el));
      break;
    case 'form.feedbackStatus':
      // render feedback status text
      feedback.textContent = translation.t(`${path}.${value}`);
      break;
    case 'form.isValidForm':
      // change feedback highlighting color
      const actualHighlight = value === true ? `text-success` : `text-danger`;
      const previousHighlight = previousValue === true ? 'text-success' : 'text-danger';
      feedback.classList.remove(previousHighlight);
      feedback.classList.add(actualHighlight);
      // change input field border color
      if (value) {
        input.classList.remove('is-invalid');
      } else {
        input.classList.add('is-invalid');
      }
      break;
    default:
      break;
  }
};
