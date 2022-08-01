import _ from 'lodash';

const renderFeed = (feed) => {
  const { feedTitle, feedDescription, active } = feed;
  const feedItem = document.createElement('li');
  feedItem.classList.add('list-group-item', 'rounded');
  feedItem.setAttribute('style', 'cursor: pointer');

  const title = document.createElement('h3');
  title.classList.add('h6', 'm-0');
  title.textContent = feedTitle;

  const description = document.createElement('p');
  description.classList.add('m-0', 'small', 'text-black-50');
  description.textContent = feedDescription;

  feedItem.appendChild(title);
  feedItem.appendChild(description);

  if (active) {
    feedItem.classList.add('bg-gradient-green');
    feedItem.classList.add('border');
    feedItem.classList.add('border-success');
  } else {
    feedItem.classList.add('border-0');
    feedItem.classList.add('border-end-0');
  }

  return feedItem;
};

const renderPosts = (post) => {
  const {
    postTitle, postLink, postId,
  } = post;
  const postItem = document.createElement('li');
  postItem.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start', 'border-0', 'border-end-0');

  const linkEl = document.createElement('a');
  linkEl.href = postLink;
  linkEl.textContent = postTitle;
  linkEl.dataset.id = postId;
  if (post.viewed) {
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
        case 'success':
          // render success feedback message
          feedback.textContent = i18n.t(`${path}.${value}`);
          feedback.classList.remove('text-danger');
          feedback.classList.add('text-success');
          formEl.reset();
          input.focus();
          break;
        default:
          // disable interface
          fieldset.setAttribute('disabled', '');
          break;
      }
      break;

    case 'feeds': {
      // render last added feed item
      feedsListContainer.innerHTML = '';
      feedsCardTitle.textContent = i18n.t('userInterface.feedsCardTitle');
      value.forEach((feed) => feedsListContainer.append(renderFeed(feed)));
      break;
    }

    case 'posts': {
      // render post items
      postsListContainer.innerHTML = '';
      postsCardTitle.textContent = i18n.t('userInterface.postsCardTitle');
      const isAnyActiveFeed = value.some((post) => post.show === true);
      if (isAnyActiveFeed) {
        // show specified posts
        const renderedPostElements = value.map((post) => {
          if (post.show) {
            return renderPosts(post);
          }
          return null;
        }).filter((val) => val !== null);
        renderedPostElements.forEach((el) => {
          const modalButtonPreview = el.querySelector('button');
          modalButtonPreview.textContent = i18n.t('userInterface.modalButtonPreview');
          postsListContainer.prepend(el);
        });
      } else {
        // show all posts
        const renderedPostElements = value.map((post) => renderPosts(post));
        renderedPostElements.forEach((el) => {
          const modalButtonPreview = el.querySelector('button');
          modalButtonPreview.textContent = i18n.t('userInterface.modalButtonPreview');
          postsListContainer.prepend(el);
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

    case 'errors': {
      // render fail feedback message
      const errorMessage = _.last(value);
      feedback.textContent = i18n.t(`${path}.${errorMessage}`);
      feedback.classList.add('text-danger');
      feedback.classList.remove('text-success');
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
