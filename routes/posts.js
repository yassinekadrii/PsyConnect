const express = require('express');
const router = express.Router();
const { createPost, getAllPosts, deletePost } = require('../controllers/postController');
const { auth, isDoctor } = require('../middleware/auth');

// @route   GET /api/posts
// @desc    Get all posts
// @access  Public
router.get('/', getAllPosts);

// @route   POST /api/posts
// @desc    Create a new post
// @access  Doctor only
router.post('/', auth, isDoctor, createPost);

// @route   DELETE /api/posts/:id
// @desc    Delete a post
// @access  Doctor only (owner)
router.delete('/:id', auth, isDoctor, deletePost);

module.exports = router;
