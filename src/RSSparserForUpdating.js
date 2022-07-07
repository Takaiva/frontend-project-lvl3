export default (data) => new Promise((resolve, reject) => {
  const parser = new DOMParser();
  const parsedRSS = parser.parseFromString(data, 'application/xhtml+xml');
  if (parsedRSS.querySelector('parsererror')) {
    reject(new Error('parsingError'));
  } else {
    const postElements = parsedRSS.querySelectorAll('item');
    const posts = Array.from(postElements).reduce((acc, item) => {
      const postTitle = item.querySelector('title').textContent;
      const postDescription = item.querySelector('description').textContent;
      const postLink = item.querySelector('link').textContent;
      acc.push({
        feedId: '',
        postId: '',
        postTitle,
        postDescription,
        postLink,
      });
      return acc;
    }, []);
    resolve({ posts });
  }
});
