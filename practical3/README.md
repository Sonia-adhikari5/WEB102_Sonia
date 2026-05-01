# WEB102 — Practical 3: File Upload on the Server Application

**Student:** Sonia Adhikari  
**Module:** WEB102 — Backend Web Development  
**Date:** May 2026

---

## Objective

Implement a server-side file upload system using Node.js and Express that can properly receive, validate, store, and serve files uploaded from a React/Next.js frontend (WEB101).

---

## Tech Stack

| Package | Purpose |
|--------|---------|
| `express` | Web server framework |
| `multer` | Handles multipart/form-data file uploads |
| `cors` | Enables Cross-Origin Resource Sharing |
| `morgan` | HTTP request logger |
| `dotenv` | Environment variable management |

---

## Project Structure

```
file-upload-server/
├── server.js        ← Main Express server
├── .env             ← Environment variables
├── package.json
└── uploads/         ← Uploaded files are stored here (auto-created)
```

---

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Create a `.env` file in the root folder

```
PORT=8000
FRONTEND_URL=http://localhost:3000
```

### 3. Start the server

```bash
node server.js
```

The server will run on `http://localhost:8000`

---

## API Endpoints

### `GET /`
Health check — returns `"File Upload Server is running"`

### `POST /api/upload`
Uploads a single file.

**Accepted file types:** JPEG, PNG, PDF  
**Maximum file size:** 5MB  
**Form field name:** `file`

**Success Response:**
```json
{
  "message": "File uploaded successfully",
  "filename": "example.jpg",
  "originalName": "example.jpg",
  "mimetype": "image/jpeg",
  "size": 102400,
  "url": "/uploads/example.jpg"
}
```

**Error Responses:**
- `400` — No file uploaded or invalid file type
- `413` — File exceeds 5MB limit
- `500` — Server error

---

## Connecting the Frontend (WEB101)

In your WEB101 `page.js`, the axios POST URL must point to the Express backend:

```js
const response = await axios.post('http://localhost:8000/api/upload', formData, { ... });
```

Make sure both servers are running at the same time:
- **Backend (WEB102):** `http://localhost:8000`
- **Frontend (WEB101):** `http://localhost:3000`

---

## Difficulties Faced & How I Overcame Them

### 1. Wrong folder — `package.json` not found

**Problem:**  
Running `npm run dev` in the terminal gave this error:
```
npm error code ENOENT
npm error path C:\Users\tradh\OneDrive\Desktop\WEB101_Sonia\package.json
```

**Cause:**  
The terminal was in the root `WEB101_Sonia` folder, but the actual Next.js project was nested inside `practical3/file-upload/`.

**Solution:**  
Used `ls` to list the directory contents and navigated into the correct subfolder:
```bash
cd practical3
cd file-upload
npm run dev
```

---

### 2. Page refreshing on form submit instead of uploading

**Problem:**  
Clicking the Upload button caused the page to instantly refresh and the URL changed to `/?name=Sonia+Adhikari`. The file was never sent to the backend.

**Cause:**  
The `Dropzone` component was defined **inside** the `FileUploadForm` component. In React, this means the component is recreated as a brand new type on every render, which breaks React Hook Form's `handleSubmit` — causing the form to fall back to a default HTML GET submission.

**Solution:**  
Moved the `Dropzone` component **outside** of `FileUploadForm` (above it at the module level) and passed `setFilePreview` as a prop:

```js
// ❌ BEFORE — defined inside, breaks on every render
export default function FileUploadForm() {
  const Dropzone = ({ onDrop }) => { ... }
}

// ✅ AFTER — defined outside, stable reference
const Dropzone = ({ onDrop, setFilePreview }) => { ... }
export default function FileUploadForm() { ... }
```

---

### 3. Running two separate projects at the same time

**Problem:**  
WEB101 (frontend) and WEB102 (backend) are in completely separate folders and VS Code workspaces. It was unclear how to run both simultaneously.

**Solution:**  
Opened two separate VS Code windows — one for each project. Each window had its own integrated terminal. Started the backend first (`node server.js`), then the frontend (`npm run dev`) in the other window.

---

### 4. Understanding CORS errors between frontend and backend

**Problem:**  
Requests from the frontend on port 3000 to the backend on port 8000 are treated as cross-origin by the browser and blocked by default.

**Solution:**  
Configured the `cors` middleware in `server.js` to explicitly allow the frontend origin:

```js
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type']
}));
```

---

## Key Concepts

**Multipart Form Data** — When a file is uploaded, the browser encodes it as `multipart/form-data`, allowing binary file data and text fields to be sent together in one HTTP request. Multer parses this on the server.

**Multer** — Handles parsing, validation, naming, and saving of uploaded files. Attaches the file object to `req.file` for use in route handlers.

**CORS** — Browsers block cross-origin requests by default. The `cors` middleware adds HTTP headers that tell the browser which origins, methods, and headers are permitted.

**Progress Tracking** — Axios's `onUploadProgress` callback fires as file chunks are sent, allowing a real-time progress bar to be displayed using `progressEvent.loaded / progressEvent.total`.

**React Component Stability** — Components defined inside other components are recreated on every render. Always define components at the module level to keep references stable.

---

## Reference

GitHub Repository: [https://github.com/syangche/Backend_Practicals.git](https://github.com/syangche/Backend_Practicals.git)
