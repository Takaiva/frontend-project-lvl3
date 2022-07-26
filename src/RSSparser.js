export default (data, url = null) => {
  const parser = new DOMParser();
  const parsedRSS = parser.parseFromString(data, 'application/xml');
  if (parsedRSS.querySelector('parsererror')) {
    throw new Error('parsingError');
  } else {
    try {
      const feedTitle = parsedRSS.querySelector('channel>title').textContent;
      const feedDescription = parsedRSS.querySelector('channel>description').textContent;
      const feedLink = parsedRSS.querySelector('channel>link').textContent;
      const feedOriginLink = url;
      const feed = {
        feedTitle,
        feedDescription,
        feedLink,
        feedOriginLink,
      };
      const postElements = parsedRSS.querySelectorAll('item');
      const posts = Array.from(postElements).reduce((acc, item) => {
        const postTitle = item.querySelector('title').textContent;
        const postDescription = item.querySelector('description').textContent;
        const postLink = item.querySelector('link').textContent;
        acc.push({
          postTitle,
          postDescription,
          postLink,
        });
        return acc;
      }, []);
      if (!url) {
        return ({ posts });
      }
      return ({ feed, posts });
    } catch (e) {
      throw new Error('unknownError');
    }
  }
};
