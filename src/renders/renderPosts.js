export default (postTitle, postLink, postId, feedId) => {
  const postItem = document.createElement('li');
  postItem.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start', 'border-0', 'border-end-0');
  postItem.innerHTML = `
<a href="${postLink}" class="fw-bold"  data-feed-id="${feedId}" data-id="${postId}" target="_blank" rel="noopener noreferrer">
${postTitle}
</a>
<button type="button" class="btn btn-outline-primary btn-sm" data-id="2" data-bs-toggle="modal" data-bs-target="#modal">
Preview
</button>`;
  return postItem;
};
