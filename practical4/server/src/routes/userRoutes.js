const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  getUserVideos,
  getFollowers,
  getFollowing
} = require('../controllers/userController');
const { protect } = require('../middleware/auth');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/', getUsers);
router.get('/:id', getUser);
router.put('/:id', protect, updateUser);
router.delete('/:id', protect, deleteUser);
router.get('/:id/videos', getUserVideos);
router.get('/:id/followers', getFollowers);
router.get('/:id/following', getFollowing);

module.exports = router;