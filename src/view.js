const renderFeed = (feedTitle, feedDescription) => {
  const feedItem = document.createElement('li');
  feedItem.classList.add('list-group-item', 'border-0', 'border-end-0', 'rounded');
  feedItem.setAttribute('style', 'cursor: pointer');

  const title = document.createElement('h3');
  title.classList.add('h6', 'm-0');
  title.textContent = feedTitle;

  const description = document.createElement('p');
  description.classList.add('m-0', 'small', 'text-black-50');
  description.textContent = feedDescription;

  feedItem.appendChild(title);
  feedItem.appendChild(description);

  feedItem.addEventListener('click', (e) => {
    const el = e.target.closest('li');
    el.classList.toggle('bg-gradient-green');
    el.classList.toggle('border-0');
    el.classList.toggle('border-end-0');
    el.classList.toggle('border');
    el.classList.toggle('border-success');
  });

  return { feedItem };
};

const renderPosts = (post) => {
  const {
    postTitle, postLink, postId, viewed,
  } = post;
  const postItem = document.createElement('li');
  postItem.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start', 'border-0', 'border-end-0');

  const linkEl = document.createElement('a');
  linkEl.href = postLink;
  linkEl.textContent = postTitle;
  linkEl.dataset.id = postId;
  if (viewed === true) {
    linkEl.classList.add('fw-normal', 'link-secondary');
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
  buttonEl.textContent = 'Просмотр';

  postItem.append(linkEl);
  postItem.append(buttonEl);

  postItem.querySelector(`a[data-id="${postId}"]`).addEventListener('click', (e) => {
    const el = e.target;
    el.classList.remove('fw-bold');
    el.classList.add('fw-normal', 'link-secondary');
    post.viewed = true;
  });

  postItem.querySelector(`button[data-id="${postId}"]`).addEventListener('click', (e) => {
    const el = e.target;
    const { id } = el.dataset;
    const linkElement = postItem.querySelector(`a[data-id="${id}"]`);
    linkElement.classList.remove('fw-bold');
    linkElement.classList.add('fw-normal', 'link-secondary');
    post.viewed = true;
  });
  return postItem;
};

export default (elements, i18n, state) => (path, value, previousValue) => {
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
      // disable interface
      if (value === 'started') {
        fieldset.setAttribute('disabled', '');
      }
      // enable interface
      if (value === 'finished') {
        fieldset.removeAttribute('disabled');
      }
      break;

    case 'feeds': {
      // render last added feed item
      feedsCardTitle.textContent = i18n.t(`userInterface.feedsCardTitle`);
      const lastAddedFeedItem = (value[value.length - 1]);
      const { feedTitle, feedDescription } = lastAddedFeedItem;
      const { feedItem } = renderFeed(feedTitle, feedDescription);
      feedsListContainer.append(feedItem);
      break;
    }

    case 'posts': {
      // render post items
      postsCardTitle.textContent = i18n.t(`userInterface.postsCardTitle`)
      postsListContainer.innerHTML = '';
      const isAnyActiveFeed = value.some((post) => post.show === true);
      if (isAnyActiveFeed) {
        const renderedPostElements = value.map((post) => {
          if (post.show === true) {
            return renderPosts(post);
          }
          return null;
        }).filter((val) => val !== null);
        renderedPostElements.map((el) => postsListContainer.prepend(el));
      } else {
        const renderedPostElements = value.map((post) => renderPosts(post));
        renderedPostElements.map((el) => postsListContainer.prepend(el));
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
      if (value === 'success') {
        formEl.reset();
        input.focus();
      }
      break;
    }

    case 'form.isValid': {
      const actualHighlight = value === true ? 'text-success' : 'text-danger';
      const previousHighlight = previousValue === true ? 'text-success' : 'text-danger';
      feedback.classList.remove(previousHighlight);
      feedback.classList.add(actualHighlight);
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
        feedsCardTitle: document.querySelector('.feeds .card-title'),
        postsCardTitle: document.querySelector('.posts .card-title'),
        preview: document.querySelectorAll('button[data-bs-toggle="modal"]'),
        label: document.querySelector('label[for="url-input"]'),
        exampleLink: document.querySelector('p.mt-2.mb-0.text-muted'),
        modalButtonContinueReading: document.querySelector('.modal a.full-article'),
        modalButtonClose: document.querySelector('.modal button.btn-secondary'),
        feedback: document.querySelector('p.feedback'),
      };

      i18n.changeLanguage(value)
        .then((t) => t('key')).then(() => {
          translationButtons.forEach((button) => button.classList.remove('bg-success'));
          const activeTranslationButton = document.querySelector(`button[data-lang=${value}]`);
          activeTranslationButton.classList.add('bg-success');

          Object.entries(userInterface).forEach(([key, el]) => {
            if (el === null || el.textContent === '') {
              return;
            }

            switch (key) {
              case 'preview': {
                el.forEach((previewButton) => {
                  previewButton.textContent = i18n.t(`userInterface.${key}`);
                });
                break;
              }
              case 'feedback': {
                el.textContent = state.form.feedbackStatus === null ? '' : i18n.t(`form.feedbackStatus.${state.form.feedbackStatus}`);
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
