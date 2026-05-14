const prisma = require('../lib/prisma');
const { uploadFile, deleteFile } = require('../services/storageService');

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
    const { caption, audioName } = req.body;
    const userId = req.user.id;

    if (!req.files || !req.files.video) {
      return res.status(400).json({ message: 'Video file is required' });
    }

    // Upload video to Supabase
    const videoFile = req.files.video[0];
    const videoPath = `${Date.now()}_${videoFile.originalname}`;
    const videoResult = await uploadFile(
      'videos',
      videoPath,
      videoFile.buffer,
      videoFile.mimetype
    );

    // Upload thumbnail if provided
    let thumbnailResult = null;
    if (req.files.thumbnail) {
      const thumbFile = req.files.thumbnail[0];
      const thumbPath = `${Date.now()}_${thumbFile.originalname}`;
      thumbnailResult = await uploadFile(
        'thumbnails',
        thumbPath,
        thumbFile.buffer,
        thumbFile.mimetype
      );
    }

    
    
    const video = await prisma.video.create({
      data: {
        userId,
        caption,
        audioName,
        videoUrl: videoResult.url,
        videoStoragePath: videoResult.path,
        thumbnailUrl: thumbnailResult?.url || null,
        thumbnailStoragePath: thumbnailResult?.path || null,
      },
      include: { user: { select: { id: true, username: true, avatar: true } } }
    });

    res.status(201).json(video);
  } catch (error) {
    console.error('Create video error:', error);
    res.status(500).json({ message: error.message });
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
    const video = await prisma.video.findUnique({
      where: { id: parseInt(req.params.id) }
    });

    if (!video) return res.status(404).json({ message: 'Video not found' });

    if (video.userId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Delete files from Supabase storage
    if (video.videoStoragePath) {
      await deleteFile('videos', video.videoStoragePath);
    }
    if (video.thumbnailStoragePath) {
      await deleteFile('thumbnails', video.thumbnailStoragePath);
    }

    await prisma.video.delete({ where: { id: parseInt(req.params.id) } });

    res.status(204).end();
  } catch (error) {
    console.error('Delete video error:', error);
    res.status(500).json({ message: error.message });
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