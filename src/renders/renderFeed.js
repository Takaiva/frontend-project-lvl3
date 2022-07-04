export default (feedTitle, feedDescription) => {
  const feedItem = document.createElement('li');
  feedItem.classList.add('list-group-item', 'border-0', 'border-end-0');

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
