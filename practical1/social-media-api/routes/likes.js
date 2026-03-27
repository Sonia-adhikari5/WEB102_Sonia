const express = require('express');
const {
  getLikes,
  getLike,
  createLike,
  deleteLike
} = require('../controllers/likeController');

const router = express.Router();

router.route('/').get(getLikes).post(createLike);

router.route('/:id').get(getLike).delete(deleteLike);

module.exports = router;