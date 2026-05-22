const express = require('express');
const router = express.Router();
const { getAllSnippets, getSnippets, createSnippet, updateSnippet, deleteSnippet, toggleFavorite } = require('../controllers/snippetController');
const { protect } = require('../middlewares/authMiddleware');

router.route('/')
    .get(protect, getAllSnippets)
    .post(protect, createSnippet);

router.route('/:id')
    .put(protect, updateSnippet)
    .delete(protect, deleteSnippet);

router.route('/:id/favorite')
    .patch(protect, toggleFavorite);

router.route('/project/:projectId')
    .get(protect, getSnippets);

module.exports = router;
