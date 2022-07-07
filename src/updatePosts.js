import _ from 'lodash';
import downloadRss from './RSSdownloader.js';
import parseForUpdating from "./RSSparserForUpdating.js";

// To make post ids ordered, i am using another parsing function,
// to make correct feedId relation between posts and feeds, and
// to trigger uniqueId() only on updated post items.
// Also to not to collide with parsing function (from RSSparser.js),
// that triggers on submit event
export default (state) => {
  state.feeds.forEach((feed) => {
    downloadRss(feed.feedOriginLink)
      .then((response) => {
        parseForUpdating(response.data.contents)
          .then(({ posts }) => {
            const updatedPosts = posts;
            const oldPostTitles = state.posts.map((post) => post.postTitle);
            const allNewPostTitles = updatedPosts.map((post) => post.postTitle);
            const newPostsTitles = _.differenceWith(allNewPostTitles, oldPostTitles, _.isEqual);
            newPostsTitles.forEach((title) => {
              const newPost = updatedPosts.find((post) => post.postTitle === title);
              console.log(newPost);
              newPost.feedId = feed.feedId;
              newPost.postId = Number(_.uniqueId());
              state.posts = (state.posts).concat([newPost]);
            });
          });
      });
  });
};
