export default (post) => {
  const {
    postTitle, postLink, postId, viewed,
  } = post;
  const postItem = document.createElement('li');
  postItem.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start', 'border-0', 'border-end-0');
  if (viewed === true) {
    postItem.innerHTML = `
<a href="${postLink}" class="fw-normal link-secondary" data-id=${postId} target="_blank" rel="noopener noreferrer">
${postTitle}
</a>
<button type="button" class="btn btn-outline-primary btn-sm" data-id=${postId} data-bs-toggle="modal" data-bs-target="#modal">
Просмотр
</button>`;
  } else {
    postItem.innerHTML = `
<a href="${postLink}" class="fw-bold" data-id=${postId} target="_blank" rel="noopener noreferrer">
${postTitle}
</a>
<button type="button" class="btn btn-outline-primary btn-sm" data-id=${postId} data-bs-toggle="modal" data-bs-target="#modal">
Просмотр
</button>`;
  }

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
