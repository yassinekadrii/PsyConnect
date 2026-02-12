/**
 * @file controllers/postController.js
 * @description Controller for managing blog posts created by doctors.
 */

const Post = require('../models/Post');

// @desc    Create a new post
// @route   POST /api/posts
// @access  Doctor only
const createPost = async (req, res) => {
    try {
        const { title, content } = req.body;

        if (!title || !content) {
            return res.status(400).json({
                success: false,
                message: 'Le titre et le contenu sont requis.'
            });
        }

        const post = new Post({
            doctor: req.user.id,
            title,
            content
        });

        await post.save();

        res.status(201).json({
            success: true,
            message: 'Post créé avec succès.',
            post
        });
    } catch (error) {
        console.error('Create post error:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la création du post.',
            error: error.message
        });
    }
};

// @desc    Get all posts
// @route   GET /api/posts
// @access  Public
const getAllPosts = async (req, res) => {
    try {
        const posts = await Post.find()
            .populate('doctor', 'firstName lastName specialty profilePicture')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: posts.length,
            posts
        });
    } catch (error) {
        console.error('Get posts error:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération des posts.',
            error: error.message
        });
    }
};

// @desc    Delete a post
// @route   DELETE /api/posts/:id
// @access  Doctor only (owner)
const deletePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({
                success: false,
                message: 'Post non trouvé.'
            });
        }

        // Check ownership
        if (post.doctor.toString() !== req.user.id) {
            return res.status(401).json({
                success: false,
                message: 'Non autorisé à supprimer ce post.'
            });
        }

        await post.remove();

        res.status(200).json({
            success: true,
            message: 'Post supprimé avec succès.'
        });
    } catch (error) {
        console.error('Delete post error:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la suppression du post.',
            error: error.message
        });
    }
};

module.exports = {
    createPost,
    getAllPosts,
    deletePost
};
