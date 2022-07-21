export default (state, feedElement) => {
  feedElement.addEventListener('click', (e) => {
    const liEl = e.target.closest('li');
    liEl.classList.toggle('border-0');
    liEl.classList.toggle('border-end-0');
    liEl.classList.toggle('border');
    liEl.classList.toggle('border-success');
    const title = liEl.querySelector('h3');
    const titleText = title.textContent;
    const correspondingFeed = (state.feeds).find((feedItem) => feedItem.feedTitle === titleText);
    const id = correspondingFeed.feedId;
    state.posts.forEach((post) => {
      if (post.feedId === id) {
        post.show = !post.show;
      }
    });
    const isAnyActiveFeed = state.posts.some((post) => post.show === id);
    if (!isAnyActiveFeed) {
      state.posts.forEach((post) => post.show === null);
    }
  });
};
