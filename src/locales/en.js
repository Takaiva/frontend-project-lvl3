export default {
  translation: {
    userInterface: {
      submitButton: 'Submit',
      feedsCardTitle: 'Feeds',
      postsCardTitle: 'Posts',
      preview: 'Preview',
      label: 'RSS link',
      exampleLink: 'Example: https://habr.com/ru/rss/hubs/all/',
      modalButtonContinueReading: 'Continue reading',
      modalButtonClose: 'Close',
    },
    form: {
      feedbackStatus: {
        success: 'RSS successfully loaded',
        failure: {
          isEmpty: 'Should not be empty',
          notOneOf: 'Provided RSS already exists',
          validationError: 'Invalid URL',
          parsingError: 'Provided resource does not contain valid RSS',
          badResponse: 'Server returned error, most likely the session has expired, please refresh the page and try again',
          noResponse: 'Bad connection or server is not responding',
          unknownError: 'Unknown error. Something went wrong.',
        },
      },
    },
  },
};
