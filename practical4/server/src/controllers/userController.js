const prisma = require('../lib/prisma');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });
};

// @desc    Register a new user
// @route   POST /api/users/register
exports.registerUser = async (req, res) => {
  try {
    const { username, email, password, name, bio } = req.body;

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: { OR: [{ email }, { username }] }
    });

    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        name,
        bio
      }
    });

    res.status(201).json({
      id: user.id,
      username: user.username,
      email: user.email,
      name: user.name,
      token: generateToken(user.id)
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Login user
// @route   POST /api/users/login
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    res.json({
      id: user.id,
      username: user.username,
      email: user.email,
      name: user.name,
      token: generateToken(user.id)
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all users
// @route   GET /api/users
exports.getUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        name: true,
        bio: true,
        avatar: true,
        createdAt: true
      }
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get single user
// @route   GET /api/users/:id
exports.getUser = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: parseInt(req.params.id) },
      select: {
        id: true,
        username: true,
        email: true,
        name: true,
        bio: true,
        avatar: true,
        createdAt: true,
        _count: {
          select: {
            videos: true,
            followers: true,
            following: true
          }
        }
      }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update user
// @route   PUT /api/users/:id
exports.updateUser = async (req, res) => {
  try {
    const { name, bio, avatar } = req.body;

    const user = await prisma.user.update({
      where: { id: parseInt(req.params.id) },
      data: { name, bio, avatar },
      select: {
        id: true,
        username: true,
        email: true,
        name: true,
        bio: true,
        avatar: true
      }
    });

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
exports.deleteUser = async (req, res) => {
  try {
    await prisma.user.delete({
      where: { id: parseInt(req.params.id) }
    });
    res.json({ message: 'User deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get user videos
// @route   GET /api/users/:id/videos
exports.getUserVideos = async (req, res) => {
  try {
    const videos = await prisma.video.findMany({
      where: { userId: parseInt(req.params.id) },
      include: {
        user: { select: { id: true, username: true, avatar: true } },
        _count: { select: { likes: true, comments: true } }
      }
    });
    res.json(videos);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get user followers
// @route   GET /api/users/:id/followers
exports.getFollowers = async (req, res) => {
  try {
    const follows = await prisma.follow.findMany({
      where: { followingId: parseInt(req.params.id) },
      include: {
        follower: { select: { id: true, username: true, name: true, avatar: true } }
      }
    });
    res.json(follows.map(f => f.follower));
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get user following
// @route   GET /api/users/:id/following
exports.getFollowing = async (req, res) => {
  try {
    const follows = await prisma.follow.findMany({
      where: { followerId: parseInt(req.params.id) },
      include: {
        following: { select: { id: true, username: true, name: true, avatar: true } }
      }
    });
    res.json(follows.map(f => f.following));
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};