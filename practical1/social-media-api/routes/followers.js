const express = require('express');
const {
  getFollowers,
  getFollower,
  followUser,
  unfollowUser
} = require('../controllers/followerController');

const router = express.Router();

router.route('/').get(getFollowers).post(followUser);

router.route('/:id').get(getFollower).delete(unfollowUser);

module.exports = router;