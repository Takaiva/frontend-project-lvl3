import i18next from 'i18next';
import resources from './locales/index.js';
import renderPostsAndFeedsContainers from './renders/renderPostsFeedsContainers.js';
import renderFeed from './renders/renderFeed.js';
import renderPosts from './renders/renderPosts.js';

export default (elements, language) => (path, value, previousValue) => {
  const i18n = i18next.createInstance();
  i18n.init({
    lng: language,
    debug: false,
    resources,
  }).then((t) => { t('key'); });

  const {
    feedback, input, fieldset, feedsContainer, postsContainer, modalWindow,
  } = elements;

  switch (path) {
    case 'feedFetchingProcess':
      // disable interface
      if (value === 'started') {
        fieldset.setAttribute('disabled', '');
      }
      // enable interface
      if (value === 'finished') {
        fieldset.removeAttribute('disabled');
      }
      break;
    case 'postsAndFeedsContainersState':
      if (value === 'render') {
        // when the first rss successfully downloaded,
        // render templates for feeds and posts containers
        renderPostsAndFeedsContainers(feedsContainer, postsContainer);
      }
      break;
    case 'feeds': {
      // render last added feed item
      const feedItemsContainer = document.querySelector('div.feeds ul.list-group');
      const lastAddedFeedItem = (value[value.length - 1]);
      const { feedTitle, feedDescription } = lastAddedFeedItem;
      const { feedItem } = renderFeed(feedTitle, feedDescription);
      feedItemsContainer.prepend(feedItem);
      break;
    }
    case 'posts': {
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
    }
    case 'modalWindowObject': {
      const modalTitle = modalWindow.querySelector('.modal-title');
      const modalBody = modalWindow.querySelector('.modal-body');
      const linkToOriginal = modalWindow.querySelector('.full-article');
      const { postTitle, postDescription, postLink } = value;
      // remove links from the description as if often refers
      // just to original article source, and we have a button for it
      const postDescriptionWithNoHrefs = postDescription.replaceAll(/<a.+a>/g, '');
      modalTitle.textContent = postTitle;
      // using innerHTML instead of textContent as some sources provide
      // embedded html elements for formatting in post descriptions like <p>
      modalBody.textContent = postDescriptionWithNoHrefs;
      linkToOriginal.href = postLink;
      break;
    }
    case 'form.feedbackStatus': {
      // render feedback status message
      feedback.textContent = i18n.t(`${path}.${value}`);
      break;
    }
    case 'form.isValidForm': {
      // change feedback highlighting color
      const actualHighlight = value === true ? 'text-success' : 'text-danger';
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
    }
    case 'currentLng': {
      const userInterface = {
        submitButton: document.querySelector('button[type="submit"]'),
        feeds: document.querySelector('.feeds .card-title'),
        posts: document.querySelector('.posts .card-title'),
        preview: document.querySelectorAll('button[data-bs-toggle="modal"]'),
        exampleLink: document.querySelector('p.mt-2.mb-0.text-muted'),
        label: document.querySelector('label[for="url-input"]'),
        modalButtonContinueReading: document.querySelector('.modal a.full-article'),
        modalButtonClose: document.querySelector('.modal button.btn-secondary'),
      };

      i18n.changeLanguage(value)
        .then((t) => t('key'));

      // translate interface
      Object.entries(userInterface).forEach(([key, el]) => {
        if (el === null) {
          return;
        }
        // translate user interface
        if (key === 'preview') {
          el.forEach((previewButton) => {
            previewButton.textContent = i18n.t(`userInterface.${key}`);
          });
        } else {
          el.textContent = i18n.t(`userInterface.${key}`);
        }
      });
      break;
    }
    default:
      break;
  }
};
