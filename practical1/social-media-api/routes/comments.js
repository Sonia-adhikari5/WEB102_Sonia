const express = require('express');
const {
  getComments,
  getComment,
  createComment,
  updateComment,
  deleteComment
} = require('../controllers/commentController');

const router = express.Router();

router.route('/').get(getComments).post(createComment);

router.route('/:id').get(getComment).put(updateComment).delete(deleteComment);

module.exports = router;