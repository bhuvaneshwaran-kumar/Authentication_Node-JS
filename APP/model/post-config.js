const mongoose = require('mongoose');
const { post } = require('../routes');

const PostSchema = new mongoose.Schema({
    username: String,
    email:String,
    title:String,
    content: String,
    timestamp: { type: Date, default: Date.now }
});

const Post = mongoose.model('Post',PostSchema)

module.exports = Post