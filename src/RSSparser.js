import pkg from 'lodash';

const { uniqueId } = pkg;

export default (data, url, state) => new Promise((resolve, reject) => {
  const parser = new DOMParser();
  const parsedRSS = parser.parseFromString(data, 'application/xml');
  if (parsedRSS.querySelector('parsererror')) {
    reject(new Error('parsingError'));
  } else {
    const feedId = state.feeds.length + 1;
    const feedTitle = parsedRSS.querySelector('channel > title').textContent;
    const feedDescription = parsedRSS.querySelector('channel > description').textContent;
    const feedLink = parsedRSS.querySelector('channel > link').textContent;
    const feedOriginLink = url;
    const feed = {
      feedId,
      feedTitle,
      feedDescription,
      feedLink,
      feedOriginLink,
    };
    const postElements = parsedRSS.querySelectorAll('item');
    const posts = Array.from(postElements).reduce((acc, item) => {
      const postTitle = item.querySelector('title') === null ? 'Материал удалён' : item.querySelector('title').textContent;
      const postDescription = item.querySelector('description') === null ? 'Материал удалён' : item.querySelector('description').textContent;
      const postLink = item.querySelector('link') === null ? 'Материал удалён' : item.querySelector('link').textContent;
      const postId = Number(uniqueId());
      acc.push({
        feedId,
        postId,
        postTitle,
        postDescription,
        postLink,
      });
      return acc;
    }, []);
    resolve({ feed, posts });
  }
});
