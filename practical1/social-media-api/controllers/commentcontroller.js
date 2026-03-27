const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const { comments, users, posts } = require('../utils/mockData');

// @desc    Get all comments
// @route   GET /api/comments
// @access  Public
exports.getComments = asyncHandler(async (req, res, next) => {
  // Pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const total = comments.length;

  // Get paginated results
  const results = comments.slice(startIndex, endIndex);

  // Enhance comments with user and post data
  const enhancedResults = results.map(comment => {
    const user = users.find(user => user.id === comment.user_id);
    const post = posts.find(post => post.id === comment.post_id);
    return {
      ...comment,
      user: {
        id: user.id,
        username: user.username,
        full_name: user.full_name,
        profile_picture: user.profile_picture
      },
      post: {
        id: post.id,
        caption: post.caption,
        image: post.image
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

// @desc    Get single comment
// @route   GET /api/comments/:id
// @access  Public
exports.getComment = asyncHandler(async (req, res, next) => {
  const comment = comments.find(comment => comment.id === req.params.id);

  if (!comment) {
    return next(
      new ErrorResponse(`Comment not found with id of ${req.params.id}`, 404)
    );
  }

  // Enhance comment with user and post data
  const user = users.find(user => user.id === comment.user_id);
  const post = posts.find(post => post.id === comment.post_id);
  const enhancedComment = {
    ...comment,
    user: {
      id: user.id,
      username: user.username,
      full_name: user.full_name,
      profile_picture: user.profile_picture
    },
    post: {
      id: post.id,
      caption: post.caption,
      image: post.image
    }
  };

  res.status(200).json({
    success: true,
    data: enhancedComment
  });
});

// @desc    Create new comment
// @route   POST /api/comments
// @access  Private (we'll simulate this)
exports.createComment = asyncHandler(async (req, res, next) => {
  // Simulate authentication
  const userId = req.header('X-User-Id');
  if (!userId) {
    return next(new ErrorResponse('Not authorized to access this route', 401));
  }

  const user = users.find(user => user.id === userId);
  if (!user) {
    return next(new ErrorResponse('User not found', 404));
  }

  // Check if post exists
  const post = posts.find(post => post.id === req.body.post_id);
  if (!post) {
    return next(new ErrorResponse('Post not found', 404));
  }

  const newComment = {
    id: (comments.length + 1).toString(),
    text: req.body.text,
    post_id: req.body.post_id,
    user_id: userId,
    created_at: new Date().toISOString().slice(0, 10)
  };

  comments.push(newComment);

  res.status(201).json({
    success: true,
    data: newComment
  });
});

// @desc    Update comment
// @route   PUT /api/comments/:id
// @access  Private (we'll simulate this)
exports.updateComment = asyncHandler(async (req, res, next) => {
  // Simulate authentication
  const userId = req.header('X-User-Id');
  if (!userId) {
    return next(new ErrorResponse('Not authorized to access this route', 401));
  }

  let comment = comments.find(comment => comment.id === req.params.id);

  if (!comment) {
    return next(
      new ErrorResponse(`Comment not found with id of ${req.params.id}`, 404)
    );
  }

  // Check if user owns the comment
  if (comment.user_id !== userId) {
    return next(new ErrorResponse(`Not authorized to update this comment`, 401));
  }

  // Update comment
  const index = comments.findIndex(comment => comment.id === req.params.id);

  comments[index] = {
    ...comment,
    ...req.body,
    id: comment.id, // Ensure ID doesn't change
    user_id: comment.user_id, // Ensure user_id doesn't change
    post_id: comment.post_id // Ensure post_id doesn't change
  };

  res.status(200).json({
    success: true,
    data: comments[index]
  });
});

// @desc    Delete comment
// @route   DELETE /api/comments/:id
// @access  Private (we'll simulate this)
exports.deleteComment = asyncHandler(async (req, res, next) => {
  // Simulate authentication
  const userId = req.header('X-User-Id');
  if (!userId) {
    return next(new ErrorResponse('Not authorized to access this route', 401));
  }

  const comment = comments.find(comment => comment.id === req.params.id);

  if (!comment) {
    return next(
      new ErrorResponse(`Comment not found with id of ${req.params.id}`, 404)
    );
  }

  // Check if user owns the comment
  if (comment.user_id !== userId) {
    return next(new ErrorResponse(`Not authorized to delete this comment`, 401));
  }

  // Delete comment
  const index = comments.findIndex(comment => comment.id === req.params.id);
  comments.splice(index, 1);

  res.status(200).json({
    success: true,
    data: {}
  });
});