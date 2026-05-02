const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create 10 users
  const users = [];
  for (let i = 1; i <= 10; i++) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);

    const user = await prisma.user.create({
      data: {
        username: `user${i}`,
        email: `user${i}@example.com`,
        password: hashedPassword,
        name: `Test User ${i}`,
        bio: `Bio for user ${i}`
      }
    });
    users.push(user);
    console.log(`Created user: ${user.username}`);
  }

  // Create 5 videos per user (50 total)
  const videos = [];
  for (const user of users) {
    for (let v = 1; v <= 5; v++) {
      const video = await prisma.video.create({
        data: {
          title: `Video ${v} by ${user.username}`,
          description: `This is video ${v} uploaded by ${user.username}`,
          url: `https://example.com/videos/${user.id}-${v}.mp4`,
          thumbnail: `https://example.com/thumbnails/${user.id}-${v}.jpg`,
          userId: user.id
        }
      });
      videos.push(video);
    }
  }
  console.log('Created 50 videos');

  // Create 200 comments
  for (let i = 0; i < 200; i++) {
    const user = users[Math.floor(Math.random() * users.length)];
    const video = videos[Math.floor(Math.random() * videos.length)];

    await prisma.comment.create({
      data: {
        text: `Comment ${i + 1} on this video!`,
        userId: user.id,
        videoId: video.id
      }
    });
  }
  console.log('Created 200 comments');

  // Create 300 video likes
  const videoLikeSet = new Set();
  let videoLikes = 0;
  while (videoLikes < 300) {
    const user = users[Math.floor(Math.random() * users.length)];
    const video = videos[Math.floor(Math.random() * videos.length)];
    const key = `${user.id}-${video.id}`;

    if (!videoLikeSet.has(key)) {
      videoLikeSet.add(key);
      await prisma.videoLike.create({
        data: { userId: user.id, videoId: video.id }
      });
      videoLikes++;
    }
  }
  console.log('Created 300 video likes');

  // Create 40 follow relationships
  const followSet = new Set();
  let follows = 0;
  while (follows < 40) {
    const follower = users[Math.floor(Math.random() * users.length)];
    const following = users[Math.floor(Math.random() * users.length)];
    const key = `${follower.id}-${following.id}`;

    if (follower.id !== following.id && !followSet.has(key)) {
      followSet.add(key);
      await prisma.follow.create({
        data: { followerId: follower.id, followingId: following.id }
      });
      follows++;
    }
  }
  console.log('Created 40 follow relationships');

  console.log('Seeding complete!');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });