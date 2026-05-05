const express = require('express');
const router = express.Router();
const {
  getAllVideos,        
  getVideo,
  createVideo,
  updateVideo,
  deleteVideo,
  getVideoComments,
  likeVideo,
  getVideoLikes,
  getFollowingVideos  // ← new
} = require('../controllers/videoController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/', getAllVideos);                    // ← updated name
router.get('/following', protect, getFollowingVideos);  // ← new, needs protect
router.post('/', protect, upload.fields([
  { name: 'video', maxCount: 1 },
  { name: 'thumbnail', maxCount: 1 }
]), createVideo);
router.get('/:id', getVideo);
router.put('/:id', protect, updateVideo);
router.delete('/:id', protect, deleteVideo);
router.get('/:id/comments', getVideoComments);
router.get('/:id/likes', getVideoLikes);
router.post('/:id/likes', protect, likeVideo);

module.exports = router;