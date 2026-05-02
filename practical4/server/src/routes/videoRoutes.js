const express = require('express');
const router = express.Router();
const {
  getVideos,
  getVideo,
  createVideo,
  updateVideo,
  deleteVideo,
  getVideoComments,
  likeVideo,
  getVideoLikes
} = require('../controllers/videoController');
const { protect } = require('../middleware/auth');

router.get('/', getVideos);
router.post('/', protect, createVideo);
router.get('/:id', getVideo);
router.put('/:id', protect, updateVideo);
router.delete('/:id', protect, deleteVideo);
router.get('/:id/comments', getVideoComments);
router.get('/:id/likes', getVideoLikes);
router.post('/:id/likes', protect, likeVideo);

module.exports = router;