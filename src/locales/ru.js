export default {
  translation: {
    userInterface: {
      submitButton: 'Добавить',
      feeds: 'Фиды',
      posts: 'Посты',
      preview: 'Просмотр',
      exampleLink: 'Пример: https://habr.com/ru/rss/hubs/all/',
      modalButtonContinueReading: 'Читать полностью',
      modalButtonClose: 'Закрыть',
    },
    form: {
      feedbackStatus: {
        success: 'RSS успешно загружен',
        failure: {
          notOneOf: 'RSS уже существует',
          validationError: 'Ссылка должна быть валидным URL',
          parsingError: 'Ресурс не содержит валидный RSS',
          badResponse: 'Сервер вернул ошибку, скорее всего сессия истекла, обновите страницу и повторите попытку',
          noResponse: 'Плохое соединение или сервер не отвечает',
        },
      },
    },
  },
};
