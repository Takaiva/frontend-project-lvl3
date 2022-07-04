import pkg from 'lodash';

const { uniqueId } = pkg;

export default (data) => new Promise((resolve, reject) => {
  const parser = new DOMParser();
  const parsedRSS = parser.parseFromString(data, 'application/xhtml+xml');
  if (parsedRSS.querySelector('parsererror')) {
    reject(new Error('parsingError'));
  } else {
    const feedId = Number(uniqueId());
    const feedTitle = parsedRSS.querySelector('channel > title').textContent;
    const feedDescription = parsedRSS.querySelector('channel > description').textContent;
    const feedLink = parsedRSS.querySelector('channel > link').textContent;
    const feed = {
      feedId,
      feedTitle,
      feedDescription,
      feedLink,
    };
    const postElements = parsedRSS.querySelectorAll('item');
    const posts = Array.from(postElements).reduce((acc, item, index) => {
      const postTitle = item.querySelector('title').textContent;
      const postDescription = item.querySelector('description').textContent;
      const postLink = item.querySelector('link').textContent;
      acc.push({
        feedId,
        postId: (index + 1),
        postTitle,
        postDescription,
        postLink,
      });
      return acc;
    }, []);
    resolve({ feed, posts });
  }
});
