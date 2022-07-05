import downloadRss from './RSSdownloader.js';
import parseRss from './RSSparser.js';
import _ from 'lodash';

export default (urls, state) => {
    urls.forEach((url) => {
        downloadRss(url)
            .then((response) => {
                parseRss(response.data.contents)
                    .then(({ posts }) => {
                        const updatedPosts = posts;
                        const oldPostTitles = state.posts.map((post) => post.postTitle)
                        const allNewPostTitles = updatedPosts.map((post) => post.postTitle);
                        const newPostsTitles = _.differenceWith(allNewPostTitles, oldPostTitles, _.isEqual);
                        newPostsTitles.forEach((title) => {
                            const newPost = updatedPosts.filter((post) => post.postTitle === title);
                            state.posts = state.posts.concat(newPost);
                        });
                    });
            });
    });
};