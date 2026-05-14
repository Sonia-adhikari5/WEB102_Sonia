# Practical 5: Implementing Cloud Bucket Storage with Supabase

**Student:** Sonia Adhikari  
**Module:** WEB102  
**Practical:** 5 — Cloud Storage Migration  
**Date:** May 2026

---

## Overview

This practical upgrades the TikTok backend application (built in Practicals 2–4) by migrating from local file storage to cloud-based storage using **Supabase Storage**. Previously, uploaded videos and thumbnails were stored in a local `uploads/` directory on the server. This practical replaces that approach with a scalable, reliable cloud storage solution.

---

## Objectives

- Understand the limitations of local file storage in web applications
- Set up Supabase Storage buckets with appropriate access policies
- Integrate the Supabase JavaScript SDK into an existing Node.js/Express backend
- Refactor the video controller to upload files directly to Supabase
- Update the Prisma schema to store cloud storage paths alongside public URLs
- Test uploads and deletions via Postman

---

## Technologies Used

| Technology | Purpose |
|---|---|
| Node.js + Express | Backend server framework |
| Supabase Storage | Cloud file storage (videos & thumbnails) |
| @supabase/supabase-js | Supabase JavaScript SDK |
| Prisma ORM | Database interaction (PostgreSQL) |
| Multer (memoryStorage) | Handling multipart file uploads in memory |
| Postman | API testing |

---

## Project Structure

The following files were created or modified for this practical, all inside `practical4/server/`:

```
practical4/server/
├── src/
│   ├── lib/
│   │   ├── prisma.js           (existing)
│   │   └── supabase.js         ← NEW: Supabase client configuration
│   ├── services/
│   │   └── storageService.js   ← NEW: Upload and delete helpers
│   ├── controllers/
│   │   └── videoController.js  ← MODIFIED: Uses Supabase instead of local disk
│   ├── middleware/
│   │   └── upload.js           ← MODIFIED: Changed to memoryStorage
│   └── app.js
├── prisma/
│   └── schema.prisma           ← MODIFIED: Added storage path fields
└── .env                        ← MODIFIED: Added Supabase credentials
```

---

## Part 1: Supabase Setup

### 1.1 Creating the Project

A new project was created on [supabase.com](https://supabase.com) with the name `Sonia-adhikari5's Project`. The project region was selected based on proximity to the target audience.

### 1.2 Creating Storage Buckets

Two public buckets were created via the Supabase dashboard under **Storage**:

| Bucket Name | Access Level | Purpose |
|---|---|---|
| `videos` | Public | Stores uploaded TikTok video files |
| `thumbnails` | Public | Stores video thumbnail images |

### 1.3 Setting Up Storage Policies

For each bucket, two policies were created:

**Policy 1 — Authenticated users can upload:**
- Allowed operations: ALL (INSERT, SELECT, UPDATE, DELETE)
- Target roles: `authenticated`

**Policy 2 — Public can view:**
```sql
CREATE POLICY "Public can view videos"
ON storage.objects
FOR SELECT
TO anon
USING ( bucket_id = 'videos' );
```

The same policies were applied to the `thumbnails` bucket.

---

## Part 2: Backend Implementation

### 2.1 Installing the Supabase SDK

```bash
npm install @supabase/supabase-js
```

### 2.2 Supabase Client — `src/lib/supabase.js`

A dedicated client file was created to initialise the Supabase connection using environment variables:

```javascript
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials. Check your environment variables.');
}

const supabase = createClient(supabaseUrl, supabaseKey);
module.exports = supabase;
```

### 2.3 Environment Variables — `.env`

The following variables were added to the existing `.env` file:

```env
SUPABASE_URL=https://oxfhosbavalznrerwqpt.supabase.co
SUPABASE_SERVICE_KEY=<service_role_secret_key>
SUPABASE_PUBLIC_KEY=<anon_public_key>
SUPABASE_STORAGE_URL=https://oxfhosbavalznrerwqpt.supabase.co/storage/v1
```

> The `SUPABASE_SERVICE_KEY` is kept secret and never committed to version control.

### 2.4 Storage Service — `src/services/storageService.js`

A reusable service was created to abstract upload and delete operations:

```javascript
const supabase = require('../lib/supabase');

const uploadFile = async (bucket, filePath, fileBuffer, mimeType) => {
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(filePath, fileBuffer, {
      contentType: mimeType,
      upsert: true
    });

  if (error) throw error;

  const { data: urlData } = supabase.storage
    .from(bucket)
    .getPublicUrl(filePath);

  return { path: filePath, url: urlData.publicUrl };
};

const deleteFile = async (bucket, filePath) => {
  const { error } = await supabase.storage
    .from(bucket)
    .remove([filePath]);

  if (error) throw error;
};

module.exports = { uploadFile, deleteFile };
```

### 2.5 Prisma Schema Update — `prisma/schema.prisma`

Two new optional fields were added to the `Video` model to store the storage paths for deletion purposes:

```prisma
model Video {
  id                   Int        @id @default(autoincrement())
  userId               Int        @map("user_id")
  caption              String?
  videoUrl             String     @map("video_url")
  thumbnailUrl         String?    @map("thumbnail_url")
  audioName            String?    @map("audio_name")
  videoStoragePath     String?    @map("video_storage_path")
  thumbnailStoragePath String?    @map("thumbnail_storage_path")
  views                Int        @default(0)
  createdAt            DateTime   @default(now()) @map("created_at")
  updatedAt            DateTime   @default(now()) @updatedAt @map("updated_at")
  comments             Comment[]
  likes                VideoLike[]
  user                 User       @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("videos")
}
```

Migration was applied with:

```bash
npx prisma migrate dev --name add_storage_paths
```

### 2.6 Updated Video Controller — `src/controllers/videoController.js`

**createVideo** was updated to upload files to Supabase instead of saving to disk:

```javascript
const createVideo = async (req, res) => {
  try {
    const { caption, audioName } = req.body;
    const userId = req.user.id;

    if (!req.files || !req.files.video) {
      return res.status(400).json({ message: 'Video file is required' });
    }

    // Upload video to Supabase
    const videoFile = req.files.video[0];
    const videoPath = `${Date.now()}_${videoFile.originalname}`;
    const videoResult = await uploadFile('videos', videoPath, videoFile.buffer, videoFile.mimetype);

    // Upload thumbnail if provided
    let thumbnailResult = null;
    if (req.files.thumbnail) {
      const thumbFile = req.files.thumbnail[0];
      const thumbPath = `${Date.now()}_${thumbFile.originalname}`;
      thumbnailResult = await uploadFile('thumbnails', thumbPath, thumbFile.buffer, thumbFile.mimetype);
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
      include: {
        user: { select: { id: true, username: true, profilePicture: true } }
      }
    });

    res.status(201).json(video);
  } catch (error) {
    console.error('Create video error:', error);
    res.status(500).json({ message: error.message });
  }
};
```

**deleteVideo** was updated to remove files from Supabase before deleting the database record:

```javascript
const deleteVideo = async (req, res) => {
  try {
    const video = await prisma.video.findUnique({
      where: { id: parseInt(req.params.id) }
    });

    if (!video) return res.status(404).json({ message: 'Video not found' });
    if (video.userId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Delete from Supabase storage
    if (video.videoStoragePath) await deleteFile('videos', video.videoStoragePath);
    if (video.thumbnailStoragePath) await deleteFile('thumbnails', video.thumbnailStoragePath);

    await prisma.video.delete({ where: { id: parseInt(req.params.id) } });
    res.status(204).end();
  } catch (error) {
    console.error('Delete video error:', error);
    res.status(500).json({ message: error.message });
  }
};
```

### 2.7 Multer — Memory Storage

Multer was updated to use `memoryStorage` instead of `diskStorage`. This is required because Supabase's SDK expects a file buffer, not a file path:

```javascript
const storage = multer.memoryStorage();
```

---

## Part 3: Testing

### 3.1 Starting the Server

```bash
npm run dev
```

### 3.2 Postman Tests

**Upload a video:**
- Method: `POST`
- URL: `http://localhost:5000/api/videos`
- Auth: Bearer token (from login)
- Body: `form-data` with `video` (file) and optional `thumbnail` (file), `caption` (text)
- Expected: `201 Created` with video object including Supabase public URL

**Delete a video:**
- Method: `DELETE`
- URL: `http://localhost:5000/api/videos/:id`
- Auth: Bearer token
- Expected: `204 No Content`, file removed from Supabase bucket

### 3.3 Verifying in Supabase Dashboard

After uploading, the file was confirmed visible in:
**Supabase Dashboard → Storage → videos bucket**

The public URL returned by the API (e.g. `https://oxfhosbavalznrerwqpt.supabase.co/storage/v1/object/public/videos/...`) was also accessible directly in the browser.

---

## Key Concepts Learned

### Why Cloud Storage over Local Storage

| Issue | Local Storage | Cloud Storage (Supabase) |
|---|---|---|
| Disk space | Limited by server | Virtually unlimited |
| Scalability | Single server only | Works across multiple servers |
| Reliability | Lost on server crash | Built-in redundancy |
| Performance | No CDN | Global CDN delivery |
| Backup | Manual | Automatic |

### How Supabase Storage Works

Files in Supabase are organised into **buckets**. Each bucket has its own access policies written in SQL (Row Level Security). Files are served via public URLs through a global CDN.

### Memory Storage vs Disk Storage (Multer)

When uploading to a cloud provider, Multer must use `memoryStorage` so the file is held in a buffer (`req.file.buffer`) rather than written to disk. The buffer is then passed directly to the Supabase SDK.

### Storage Paths

The `videoStoragePath` and `thumbnailStoragePath` fields store the internal path within the Supabase bucket (e.g. `1234567890_video.mp4`). This is separate from the public URL and is needed to delete the file later.

---

## Challenges Faced

| Challenge | Solution |
|---|---|
| Supabase dashboard updated UI — old API key layout changed | Used the "Legacy anon, service_role API keys" tab to find the correct keys |
| Storage policy editor wrapping SQL in template | Used "Create policy from scratch" with GUI fields instead of raw SQL |
| Prisma warning about dropping Video table on migration | Accepted the migration — existing local-storage rows were no longer valid |
| `SUPABASE_STORAGE_URL` not visible in dashboard | Constructed it manually by appending `/storage/v1` to the project URL |

---

## Conclusion

This practical successfully migrated the TikTok backend from local file storage to Supabase cloud storage. Videos and thumbnails are now uploaded directly to Supabase buckets, served via public CDN URLs, and automatically cleaned up when deleted. The application is now significantly more scalable and reliable, with no dependency on the local server's file system for media storage.
