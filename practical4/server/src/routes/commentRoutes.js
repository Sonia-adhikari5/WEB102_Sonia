const express = require('express');
const router = express.Router();
const {
  getComments,
  getComment,
  createComment,
  updateComment,
  deleteComment,
  likeComment,
  getCommentLikes
} = require('../controllers/commentController');
const { protect } = require('../middleware/auth');

router.get('/', getComments);
router.post('/', protect, createComment);
router.get('/:id', getComment);
router.put('/:id', protect, updateComment);
router.delete('/:id', protect, deleteComment);
router.get('/:id/likes', getCommentLikes);
router.post('/:id/likes', protect, likeComment);

module.exports = router; 