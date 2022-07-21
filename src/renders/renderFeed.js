export default (feedTitle, feedDescription) => {
  const feedItem = document.createElement('li');
  feedItem.classList.add('list-group-item', 'border-0', 'border-end-0');
  feedItem.setAttribute('style', 'cursor: pointer');

  const title = document.createElement('h3');
  title.classList.add('h6', 'm-0');
  title.textContent = feedTitle;

  const description = document.createElement('p');
  description.classList.add('m-0', 'small', 'text-black-50');
  description.textContent = feedDescription;

  feedItem.appendChild(title);
  feedItem.appendChild(description);

  /*  feedItem.addEventListener('click', (e) => {
    const liEl = e.target.closest('li');
    liEl.classList.toggle('border-0');
    liEl.classList.toggle('border-end-0');
    liEl.classList.toggle('border');
    liEl.classList.toggle('border-success');
  }); */

  return { feedItem };
};
