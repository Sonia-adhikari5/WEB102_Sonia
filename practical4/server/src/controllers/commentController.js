const prisma = require('../lib/prisma');

// @desc    Get all comments
// @route   GET /api/comments
exports.getComments = async (req, res) => {
  try {
    const comments = await prisma.comment.findMany({
      include: {
        user: { select: { id: true, username: true, avatar: true } },
        _count: { select: { likes: true } }
      }
    });
    res.json(comments);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get single comment
// @route   GET /api/comments/:id
exports.getComment = async (req, res) => {
  try {
    const comment = await prisma.comment.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        user: { select: { id: true, username: true, avatar: true } },
        _count: { select: { likes: true } }
      }
    });

    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    res.json(comment);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Create comment
// @route   POST /api/comments
exports.createComment = async (req, res) => {
  try {
    const { text, videoId } = req.body;

    const comment = await prisma.comment.create({
      data: {
        text,
        videoId: parseInt(videoId),
        userId: req.user.id
      },
      include: {
        user: { select: { id: true, username: true, avatar: true } }
      }
    });

    res.status(201).json(comment);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update comment
// @route   PUT /api/comments/:id
exports.updateComment = async (req, res) => {
  try {
    const { text } = req.body;

    const comment = await prisma.comment.update({
      where: { id: parseInt(req.params.id) },
      data: { text }
    });

    res.json(comment);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete comment
// @route   DELETE /api/comments/:id
exports.deleteComment = async (req, res) => {
  try {
    await prisma.comment.delete({
      where: { id: parseInt(req.params.id) }
    });
    res.json({ message: 'Comment deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Like a comment
// @route   POST /api/comments/:id/likes
exports.likeComment = async (req, res) => {
  try {
    const commentId = parseInt(req.params.id);
    const userId = req.user.id;

    const existing = await prisma.commentLike.findUnique({
      where: { userId_commentId: { userId, commentId } }
    });

    if (existing) {
      await prisma.commentLike.delete({
        where: { userId_commentId: { userId, commentId } }
      });
      return res.json({ message: 'Comment unliked' });
    }

    await prisma.commentLike.create({ data: { userId, commentId } });
    res.status(201).json({ message: 'Comment liked' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get comment likes
// @route   GET /api/comments/:id/likes
exports.getCommentLikes = async (req, res) => {
  try {
    const likes = await prisma.commentLike.findMany({
      where: { commentId: parseInt(req.params.id) },
      include: {
        user: { select: { id: true, username: true, avatar: true } }
      }
    });
    res.json(likes);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};