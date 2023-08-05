// Create web server

const express = require('express');
const bodyParser = require('body-parser');
const { randomBytes } = require('crypto');
const axios = require('axios');

// Create app
const app = express();

// Use body parser
app.use(bodyParser.json());

// Store comments
const commentsByPostId = {};

// Get all comments for a given post
app.get('/posts/:id/comments', (req, res) => {
    res.send(commentsByPostId[req.params.id] || []);
});

// Create a comment for a given post
app.post('/posts/:id/comments', async (req, res) => {
    // Generate a random id for the comment
    const commentId = randomBytes(4).toString('hex');

    // Get the post id from the url
    const { id } = req.params;

    // Get the comment from the request body
    const { content } = req.body;

    // Get the comments for the post id
    const comments = commentsByPostId[id] || [];

    // Push the new comment to the comments array
    comments.push({ id: commentId, content, status: 'pending' });

    // Update the comments for the post id
    commentsByPostId[id] = comments;

    // Send the comment as the response
    await axios.post('http://localhost:4005/events', {
        type: 'CommentCreated',
        data: {
            id: commentId,
            content,
            postId: id,
            status: 'pending'
        }
    });

    // Send the response
    res.status(201).send(comments);
});

// Receive events from the event bus
app.post('/events', async (req, res) => {
    console.log('Received event:', req.body.type);

    const { type, data } = req.body;

    if (type === 'CommentModerated') {
        const { id, postId, status, content } = data;

        // Get the comments for the post id
        const comments = commentsByPostId[postId];

        // Find the comment with the id
        const comment = comments.find(comment => comment.id === id);

        // Update the status of the comment
        comment.status = status;

        // Send the event to the event bus
        await axios.post('http://localhost:4005/events', {
            type: 'CommentUpdated',
            data: {
                id,