/*
  Warnings:

  - You are about to drop the `Video` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Comment" DROP CONSTRAINT "Comment_videoId_fkey";

-- DropForeignKey
ALTER TABLE "Video" DROP CONSTRAINT "Video_userId_fkey";

-- DropForeignKey
ALTER TABLE "VideoLike" DROP CONSTRAINT "VideoLike_videoId_fkey";

-- DropTable
DROP TABLE "Video";

-- CreateTable
CREATE TABLE "videos" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "caption" TEXT,
    "video_url" TEXT NOT NULL,
    "thumbnail_url" TEXT,
    "audio_name" TEXT,
    "video_storage_path" TEXT,
    "thumbnail_storage_path" TEXT,
    "views" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "videos_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "videos" ADD CONSTRAINT "videos_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_videoId_fkey" FOREIGN KEY ("videoId") REFERENCES "videos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VideoLike" ADD CONSTRAINT "VideoLike_videoId_fkey" FOREIGN KEY ("videoId") REFERENCES "videos"("id") ON DELETE CASCADE ON UPDATE CASCADE;
