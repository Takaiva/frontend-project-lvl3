export default (feedsContainer, postsContainer) => {
  const feedsCont = feedsContainer;
  const feedBorder = document.createElement('div');
  feedBorder.classList.add('card', 'border-0');

  const feedCardBody = document.createElement('div');
  feedCardBody.classList.add('card-body');
  feedCardBody.innerHTML = '<h2 class="card-title h4">Фиды</h2>';
  feedBorder.appendChild(feedCardBody);

  const feedList = document.createElement('ul');
  feedList.classList.add('list-group', 'border-0', 'rounded-0');
  feedBorder.appendChild(feedList);

  feedsCont.appendChild(feedBorder);

  const postsCont = postsContainer;
  const postsBorder = document.createElement('div');
  postsBorder.classList.add('card', 'border-0');

  const postsCardBody = document.createElement('div');
  postsCardBody.classList.add('card-body');
  postsCardBody.innerHTML = `<h2 class="card-title h4">Посты</h2>`;
  postsBorder.appendChild(postsCardBody);

  const postsList = document.createElement('ul');
  postsList.classList.add('list-group', 'border-0', 'rounded-0');
  postsBorder.appendChild(postsList);

  postsCont.appendChild(postsBorder);
};
