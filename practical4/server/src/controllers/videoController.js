const prisma = require('../lib/prisma');

// @desc    Get all videos
// @route   GET /api/videos
exports.getAllVideos = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const cursor = req.query.cursor ? parseInt(req.query.cursor) : null;
    // ↑ parseInt because your Video id is Int in schema

    const queryOptions = {
      take: limit + 1,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { id: true, username: true, avatar: true }
          // ↑ "avatar" not "profilePicture" — confirmed from your schema
        },
        likes: true,
        _count: { select: { comments: true } }
      }
    };

    if (cursor) {
      queryOptions.cursor = { id: cursor };
      queryOptions.skip = 1;
    }

    const videos = await prisma.video.findMany(queryOptions);

    const hasNextPage = videos.length > limit;
    if (hasNextPage) videos.pop();
    const nextCursor = hasNextPage ? videos[videos.length - 1].id : null;

    res.status(200).json({ videos, nextCursor, hasNextPage });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// @desc    Get single video
// @route   GET /api/videos/:id
exports.getVideo = async (req, res) => {
  try {
    const video = await prisma.video.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        user: { select: { id: true, username: true, avatar: true } },
        _count: { select: { likes: true, comments: true } }
      }
    });

    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }

    res.json(video);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Create video
// @route   POST /api/videos
exports.createVideo = async (req, res) => {
  try {
    const { title, description } = req.body;

    if (!req.files || !req.files['video']) {
      return res.status(400).json({ message: 'Video file is required' });
    }

    const videoFile = req.files['video'][0];
    const thumbnailFile = req.files['thumbnail'] ? req.files['thumbnail'][0] : null;

    const url = `http://localhost:5000/uploads/${videoFile.filename}`;
    const thumbnail = thumbnailFile 
      ? `http://localhost:5000/uploads/${thumbnailFile.filename}` 
      : null;

    const video = await prisma.video.create({
      data: {
        title: title || 'Untitled',
        description,
        url,
        thumbnail,
        userId: req.user.id
      }
    });

    res.status(201).json(video);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};


// @desc    Update video
// @route   PUT /api/videos/:id
exports.updateVideo = async (req, res) => {
  try {
    const { title, description, thumbnail } = req.body;

    const video = await prisma.video.update({
      where: { id: parseInt(req.params.id) },
      data: { title, description, thumbnail }
    });

    res.json(video);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete video
// @route   DELETE /api/videos/:id
exports.deleteVideo = async (req, res) => {
  try {
    await prisma.video.delete({
      where: { id: parseInt(req.params.id) }
    });
    res.json({ message: 'Video deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get video comments
// @route   GET /api/videos/:id/comments
exports.getVideoComments = async (req, res) => {
  try {
    const comments = await prisma.comment.findMany({
      where: { videoId: parseInt(req.params.id) },
      include: {
        user: { select: { id: true, username: true, avatar: true } },
        _count: { select: { likes: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(comments);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Like a video
// @route   POST /api/videos/:id/likes
exports.likeVideo = async (req, res) => {
  try {
    const videoId = parseInt(req.params.id);
    const userId = req.user.id;

    const existing = await prisma.videoLike.findUnique({
      where: { userId_videoId: { userId, videoId } }
    });

    if (existing) {
      await prisma.videoLike.delete({
        where: { userId_videoId: { userId, videoId } }
      });
      return res.json({ message: 'Video unliked' });
    }

    await prisma.videoLike.create({ data: { userId, videoId } });
    res.status(201).json({ message: 'Video liked' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get video likes
// @route   GET /api/videos/:id/likes
exports.getVideoLikes = async (req, res) => {
  try {
    const likes = await prisma.videoLike.findMany({
      where: { videoId: parseInt(req.params.id) },
      include: {
        user: { select: { id: true, username: true, avatar: true } }
      }
    });
    res.json(likes);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getFollowingVideos = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const cursor = req.query.cursor ? parseInt(req.query.cursor) : null;

    // Find all users that the logged-in user follows
    const following = await prisma.follow.findMany({
      where: { followerId: req.user.id },
      select: { followingId: true }
    });

    const followingIds = following.map(f => f.followingId);

    const queryOptions = {
      take: limit + 1,
      where: { userId: { in: followingIds } },
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { id: true, username: true, avatar: true }
        },
        likes: true,
        _count: { select: { comments: true } }
      }
    };

    if (cursor) {
      queryOptions.cursor = { id: cursor };
      queryOptions.skip = 1;
    }

    const videos = await prisma.video.findMany(queryOptions);

    const hasNextPage = videos.length > limit;
    if (hasNextPage) videos.pop();
    const nextCursor = hasNextPage ? videos[videos.length - 1].id : null;

    res.status(200).json({ videos, nextCursor, hasNextPage });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};