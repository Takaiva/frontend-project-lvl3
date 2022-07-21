import renderPostsAndFeedsContainers from './renders/renderPostsFeedsContainers.js';
import renderFeed from './renders/renderFeed.js';
import renderPosts from './renders/renderPosts.js';
import resources from './locales/index.js';

export default (elements, i18n) => (path, value, previousValue) => {
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
      feedItemsContainer.append(feedItem);
      break;
    }
    case 'posts': {
      // render post items
      const postItemsContainer = document.querySelector('div.posts ul.list-group');
      postItemsContainer.innerHTML = '';
      const isAnyActiveFeed = value.some((post) => post.show === true);
      if (isAnyActiveFeed) {
        const renderedPostElements = value.map(({
          postTitle, postLink, postId, feedId, show,
        }) => {
          if (show) {
            return renderPosts(postTitle, postLink, postId, feedId);
          }
          return null;
        }).filter((val) => val !== null);
        renderedPostElements.forEach((el) => postItemsContainer.prepend(el));
      } else {
        const renderedPostElements = value.map(({
          postTitle, postLink, postId, feedId,
        }) => renderPosts(postTitle, postLink, postId, feedId));
        renderedPostElements.map((el) => postItemsContainer.prepend(el));
      }
      break;
    }

    case 'modalWindowObject': {
      const modalTitle = modalWindow.querySelector('.modal-title');
      const modalBody = modalWindow.querySelector('.modal-body');
      const linkToOriginal = modalWindow.querySelector('.full-article');
      const { postTitle, postDescription, postLink } = value;
      // remove last <a>...</a> pattern occurrence from the description as it often refers
      // just to original article source, but we have a button for it,
      // and save other <a>...</a> pattern occurrences as they often contain needed text
      const postDescriptionWithNoLastHref = postDescription.replaceAll(/(<a)(?!.*\1).+<\/a>/g, '');
      modalTitle.textContent = postTitle;
      // using innerHTML instead of textContent as some sources provide
      // embedded html elements for formatting in post descriptions like <p>,
      // also allows users to see images (<img>) embedded in description
      modalBody.innerHTML = postDescriptionWithNoLastHref;
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
        feedback: document.querySelector('p.feedback'),
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
        } else if (key === 'feedback') {
          const currentText = el.textContent;
          if (currentText === '') {
            return;
          }
          const previousLng = previousValue;
          if (feedback.classList.contains('text-danger')) {
            const correspondingPath = 'form.feedbackStatus.failure';
            const correspondingLocale = resources[previousLng].translation.form.feedbackStatus.failure;
            const localeKey = Object.keys(correspondingLocale)
              .find((neededKey) => correspondingLocale[neededKey] === currentText);
            el.textContent = i18n.t(`${correspondingPath}.${localeKey}`);
          } else {
            el.textContent = i18n.t('form.feedbackStatus.success');
          }
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
