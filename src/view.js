import _ from 'lodash';

const renderFeed = (feed) => {
  const { feedTitle, feedDescription, feedId } = feed;
  const feedItem = document.createElement('li');
  feedItem.classList.add('list-group-item', 'rounded');
  feedItem.setAttribute('style', 'cursor: pointer');
  feedItem.dataset.id = feedId;

  const title = document.createElement('h3');
  title.classList.add('h6', 'm-0');
  title.textContent = feedTitle;

  const description = document.createElement('p');
  description.classList.add('m-0', 'small', 'text-black-50');
  description.textContent = feedDescription;

  feedItem.appendChild(title);
  feedItem.appendChild(description);

  return feedItem;
};

const renderPosts = (post, viewed) => {
  const {
    postTitle, postLink, postId,
  } = post;
  const postItem = document.createElement('li');
  postItem.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start', 'border-0', 'border-end-0');

  const linkEl = document.createElement('a');
  linkEl.href = postLink;
  linkEl.textContent = postTitle;
  linkEl.dataset.id = postId;
  if (viewed) {
    linkEl.classList.add('fw-normal', 'text-secondary');
  } else {
    linkEl.classList.add('fw-bold');
  }
  linkEl.setAttribute('target', '_blank');
  linkEl.setAttribute('rel', 'noopener noreferrer');

  const buttonEl = document.createElement('button');
  buttonEl.classList.add('btn', 'btn-outline-primary', 'btn-sm');
  buttonEl.dataset.id = postId;
  buttonEl.dataset.bsToggle = 'modal';
  buttonEl.dataset.bsTarget = '#modal';

  postItem.append(linkEl);
  postItem.append(buttonEl);

  return postItem;
};

export default (elements, i18n, state) => (path, value) => {
  const {
    formEl,
    feedback,
    input,
    fieldset,
    feedsListContainer,
    feedsCardTitle,
    postsListContainer,
    postsCardTitle,
    modalWindow,
    translationButtons,
  } = elements;

  switch (path) {
    case 'feedFetchingProcess':
      switch (value) {
        case 'awaiting':
          // enable interface
          fieldset.removeAttribute('disabled');
          break;
        case 'started':
          // disable interface
          fieldset.setAttribute('disabled', '');
          break;
        case 'success':
          // render success feedback message
          feedback.textContent = i18n.t(`${path}.${value}`);
          feedback.classList.remove('text-danger');
          feedback.classList.add('text-success');
          formEl.reset();
          input.focus();
          break;
        case 'rejected': {
          const errorMessage = _.last(state.errors);
          feedback.textContent = i18n.t(`errors.${errorMessage}`);
          feedback.classList.add('text-danger');
          feedback.classList.remove('text-success');
          break;
        }
        default:
          break;
      }
      break;

    case 'feeds': {
      // render last added feed item
      feedsCardTitle.textContent = i18n.t('userInterface.feedsCardTitle');
      const feed = _.last(value);
      const renderedFeed = renderFeed(feed);
      feedsListContainer.append(renderedFeed);
      break;
    }

    case 'posts': {
      postsCardTitle.textContent = i18n.t('userInterface.postsCardTitle');
      break;
    }

    case 'uiState.feeds': {
      value.forEach(({ feedId, displaySeparately }) => {
        const feedElement = feedsListContainer.querySelector(`li[data-id="${feedId}"`);
        if (displaySeparately) {
          feedElement.classList.add('bg-gradient-green');
          feedElement.classList.add('border');
          feedElement.classList.add('border-success');
          feedElement.classList.remove('border-0');
          feedElement.classList.remove('border-end-0');
        } else {
          feedElement.classList.remove('bg-gradient-green');
          feedElement.classList.remove('border');
          feedElement.classList.remove('border-success');
          feedElement.classList.add('border-0');
          feedElement.classList.add('border-end-0');
        }
      });
      break;
    }

    case 'uiState.posts': {
      postsListContainer.innerHTML = '';
      const isAnyActiveFeed = state.uiState.feeds.some((uiFeed) => uiFeed.displaySeparately === true);
      if (isAnyActiveFeed) {
        state.uiState.posts.forEach(({ postId, viewed, show }) => {
          if (show) {
            const neededPost = state.posts.find((post) => post.postId === postId);
            const renderedPostElement = renderPosts(neededPost, viewed);
            const modalButtonPreview = renderedPostElement.querySelector('button');
            modalButtonPreview.textContent = i18n.t('userInterface.modalButtonPreview');
            postsListContainer.prepend(renderedPostElement);
          }
        });
      } else {
        value.forEach(({ postId, viewed }) => {
          const neededPost = state.posts.find((post) => post.postId === postId);
          const renderedPostElement = renderPosts(neededPost, viewed);
          const modalButtonPreview = renderedPostElement.querySelector('button');
          modalButtonPreview.textContent = i18n.t('userInterface.modalButtonPreview');
          postsListContainer.prepend(renderedPostElement);
        });
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

    case 'form.isValid': {
      switch (value) {
        case 'true':
          // remove red input border
          input.classList.remove('is-invalid');
          break;
        case 'false':
          // add red input border
          input.classList.add('is-invalid');
          break;
        default:
          break;
      }
      break;
    }

    case 'currentLng': {
      const userInterface = {
        submitButton: document.querySelector('button[type="submit"]'),
        feedsCardTitle: document.querySelector('.feeds .card-title'),
        postsCardTitle: document.querySelector('.posts .card-title'),
        label: document.querySelector('label[for="url-input"]'),
        exampleLink: document.querySelector('p.mt-2.mb-0.text-muted'),
        modalButtonPreview: document.querySelectorAll('button[data-bs-toggle="modal"]'),
        modalButtonContinueReading: document.querySelector('.modal a.full-article'),
        modalButtonClose: document.querySelector('.modal button.btn-secondary'),
        feedback: document.querySelector('p.feedback'),
      };

      i18n.changeLanguage(value)
        .then((t) => t('key')).then(() => {
          // highlight current active language button
          translationButtons.forEach((button) => button.classList.remove('bg-success'));
          const activeTranslationButton = document.querySelector(`button[data-lang=${value}]`);
          activeTranslationButton.classList.add('bg-success');

          // translate interface
          Object.entries(userInterface).forEach(([key, el]) => {
            if (el === null || el.textContent === '') {
              return;
            }

            switch (key) {
              case 'modalButtonPreview': {
                el.forEach((previewButton) => {
                  previewButton.textContent = i18n.t(`userInterface.${key}`);
                });
                break;
              }
              case 'feedback': {
                if (state.form.isValid) {
                  el.textContent = i18n.t('feedFetchingProcess.success');
                } else {
                  const errorMessage = _.last(state.errors);
                  el.textContent = errorMessage === undefined ? '' : i18n.t(`errors.${errorMessage}`);
                }
                break;
              }
              default: {
                el.textContent = i18n.t(`userInterface.${key}`);
                break;
              }
            }
          });
        });
      break;
    }
    default:
      break;
  }
};
