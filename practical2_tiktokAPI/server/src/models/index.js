let dataStore = {

  // users - 3 sample users
  users: [
    {
      id: 1,
      username: 'john_doe',
      email: 'john@example.com',
      name: 'John Doe',
      followers: [2],
      following: [2],
      createdAt: new Date().toISOString()
    },
    {
      id: 2,
      username: 'jane_smith',
      email: 'jane@example.com',
      name: 'Jane Smith',
      followers: [1],
      following: [1],
      createdAt: new Date().toISOString()
    },
    {
      id: 3,
      username: 'bob_wilson',
      email: 'bob@example.com',
      name: 'Bob Wilson',
      followers: [],
      following: [],
      createdAt: new Date().toISOString()
    }
  ],

  // videos - 3 sample videos
  videos: [
    {
      id: 1,
      title: 'My first video',
      description: 'Check this out! #trending',
      url: 'https://example.com/video1.mp4',
      userId: 1,
      likes: [2, 3],
      createdAt: new Date().toISOString()
    },
    {
      id: 2,
      title: 'Dance challenge',
      description: 'Learning to dance #fun',
      url: 'https://example.com/video2.mp4',
      userId: 2,
      likes: [1],
      createdAt: new Date().toISOString()
    },
    {
      id: 3,
      title: 'Sunset timelapse',
      description: 'Beautiful sunset #nature',
      url: 'https://example.com/video3.mp4',
      userId: 1,
      likes: [],
      createdAt: new Date().toISOString()
    }
  ],

  // comments - 3 sample comments
  comments: [
    {
      id: 1,
      text: 'Great video!',
      userId: 2,
      videoId: 1,
      likes: [1, 3],
      createdAt: new Date().toISOString()
    },
    {
      id: 2,
      text: 'Love this content',
      userId: 3,
      videoId: 1,
      likes: [],
      createdAt: new Date().toISOString()
    },
    {
      id: 3,
      text: 'Amazing moves!',
      userId: 1,
      videoId: 2,
      likes: [2],
      createdAt: new Date().toISOString()
    }
  ],

  // nextIds - auto-incrementing ID counters
  nextIds: {
    users: 4,
    videos: 4,
    comments: 4
  }
};

module.exports = dataStore;

