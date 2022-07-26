export default (state, feedElement) => {
  feedElement.addEventListener('click', (e) => {
    const liEl = e.target.closest('li');
    const title = liEl.querySelector('h3');
    const titleText = title.textContent;
    const correspondingFeed = (state.feeds).find((feedItem) => feedItem.feedTitle === titleText);
    const id = correspondingFeed.feedId;
    state.posts.forEach((post) => {
      if (post.feedId === id) {
        post.show = !post.show;
      }
    });
  });
};
