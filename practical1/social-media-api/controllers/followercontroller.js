const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const { followers, users } = require('../utils/mockData');

// @desc    Get all followers
// @route   GET /api/followers
// @access  Public
exports.getFollowers = asyncHandler(async (req, res, next) => {
  // Pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const total = followers.length;

  // Get paginated results
  const results = followers.slice(startIndex, endIndex);

  // Enhance followers with user data
  const enhancedResults = results.map(follow => {
    const follower = users.find(user => user.id === follow.follower_id);
    const following = users.find(user => user.id === follow.following_id);
    return {
      ...follow,
      follower: {
        id: follower.id,
        username: follower.username,
        full_name: follower.full_name,
        profile_picture: follower.profile_picture
      },
      following: {
        id: following.id,
        username: following.username,
        full_name: following.full_name,
        profile_picture: following.profile_picture
      }
    };
  });

  // Pagination result
  const pagination = {};

  if (endIndex < total) {
    pagination.next = {
      page: page + 1,
      limit
    };
  }

  if (startIndex > 0) {
    pagination.prev = {
      page: page - 1,
      limit
    };
  }

  res.status(200).json({
    success: true,
    count: enhancedResults.length,
    page,
    total_pages: Math.ceil(total / limit),
    pagination,
    data: enhancedResults
  });
});

// @desc    Get single follower relationship
// @route   GET /api/followers/:id
// @access  Public
exports.getFollower = asyncHandler(async (req, res, next) => {
  const follow = followers.find(follow => follow.id === req.params.id);

  if (!follow) {
    return next(
      new ErrorResponse(`Follower not found with id of ${req.params.id}`, 404)
    );
  }

  // Enhance with user data
  const follower = users.find(user => user.id === follow.follower_id);
  const following = users.find(user => user.id === follow.following_id);
  const enhancedFollow = {
    ...follow,
    follower: {
      id: follower.id,
      username: follower.username,
      full_name: follower.full_name,
      profile_picture: follower.profile_picture
    },
    following: {
      id: following.id,
      username: following.username,
      full_name: following.full_name,
      profile_picture: following.profile_picture
    }
  };

  res.status(200).json({
    success: true,
    data: enhancedFollow
  });
});

// @desc    Follow a user
// @route   POST /api/followers
// @access  Private (we'll simulate this)
exports.followUser = asyncHandler(async (req, res, next) => {
  // Simulate authentication
  const userId = req.header('X-User-Id');
  if (!userId) {
    return next(new ErrorResponse('Not authorized to access this route', 401));
  }

  const followerUser = users.find(user => user.id === userId);
  if (!followerUser) {
    return next(new ErrorResponse('User not found', 404));
  }

  // Check if user to follow exists
  const userToFollow = users.find(user => user.id === req.body.following_id);
  if (!userToFollow) {
    return next(new ErrorResponse('User to follow not found', 404));
  }

  // Check if user is trying to follow themselves
  if (userId === req.body.following_id) {
    return next(new ErrorResponse('You cannot follow yourself', 400));
  }

  // Check if already following
  const existingFollow = followers.find(
    follow => follow.follower_id === userId && follow.following_id === req.body.following_id
  );
  if (existingFollow) {
    return next(new ErrorResponse('You are already following this user', 400));
  }

  const newFollow = {
    id: (followers.length + 1).toString(),
    follower_id: userId,
    following_id: req.body.following_id,
    created_at: new Date().toISOString().slice(0, 10)
  };

  followers.push(newFollow);

  res.status(201).json({
    success: true,
    data: newFollow
  });
});

// @desc    Unfollow a user
// @route   DELETE /api/followers/:id
// @access  Private (we'll simulate this)
exports.unfollowUser = asyncHandler(async (req, res, next) => {
  // Simulate authentication
  const userId = req.header('X-User-Id');
  if (!userId) {
    return next(new ErrorResponse('Not authorized to access this route', 401));
  }

  const follow = followers.find(follow => follow.id === req.params.id);

  if (!follow) {
    return next(
      new ErrorResponse(`Follower not found with id of ${req.params.id}`, 404)
    );
  }

  // Check if user owns the follow relationship
  if (follow.follower_id !== userId) {
    return next(new ErrorResponse(`Not authorized to unfollow this user`, 401));
  }

  // Delete follow
  const index = followers.findIndex(follow => follow.id === req.params.id);
  followers.splice(index, 1);

  res.status(200).json({
    success: true,
    data: {}
  });
});