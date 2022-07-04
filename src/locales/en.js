export default {
  translation: {
    interface: {
      submitButton: 'Submit',
      feeds: 'Feeds',
      posts: 'Posts',
      preview: 'Preview',
      exampleLink: 'Example: https://habr.com/ru/rss/hubs/all/',
    },
    form: {
      feedbackStatus: {
        success: 'RSS successfully downloaded',
        failure: {
          notOneOf: 'Provided RSS already exists',
          validationError: 'Invalid URL',
          parsingError: 'Provided resource does not contain valid RSS',
          badResponse: 'Server returned error, most likely the session has expired, please refresh the page and try again',
          noResponse: 'Bad connection or server is not responding',
        },
      },
    },
  },
};
