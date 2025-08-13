const Post = require('../model/postModel');
const AppError = require('../utils/appError');

const getPosts = async () => {
    try {
        const posts = await Post.find({ isPublished: true })
            .sort({ createdAt: -1 });
        return posts;
    } catch (error) {
        throw new AppError("Could not fetch posts", 500);
    }
}

module.exports = {
    getPosts
};

