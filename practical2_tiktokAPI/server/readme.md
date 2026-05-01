# WEB102 — Practical 2: TikTok REST API

**Student:** Sonia Adhikari  
**Module:** WEB102 — Backend Web Development  
**Date:** May 2026

---

## Background

In modern web development, applications are typically divided into two main parts: the frontend and the backend. The frontend is responsible for what users see and interact with, while the backend handles data processing, storage, and communication between systems.

This project focuses on building a backend system using RESTful API principles. A REST API (Representational State Transfer Application Programming Interface) allows different systems to communicate over HTTP using standard methods such as GET, POST, PUT, and DELETE.

The goal of this practical is to simulate the backend of a TikTok-like application. This includes managing users, videos, and comments, as well as handling interactions such as likes and follows.

---

## Objective

The main objective of this project is to design and implement a RESTful API using Node.js and Express. The API will:
- Handle multiple resources (Users, Videos, Comments)
- Support CRUD operations (Create, Read, Update, Delete)
- Follow RESTful design principles
- Serve as a backend for a frontend application (e.g., Next.js)

---

## Technologies Used

| Package | Purpose |
|--------|---------|
| `node.js` | JavaScript runtime environment for server-side development |
| `express` | Web framework used to build the API |
| `nodemon` | Automatically restarts the server during development |
| `dotenv` | Manages environment variables securely |
| `body-parser` | Parses incoming request bodies |
| `cors` | Enables cross-origin resource sharing |
| `morgan` | Logs HTTP requests for debugging |

---

## Project Structure

```
server/
│
├── src/
│   ├── index.js          ← Entry point (starts server)
│   ├── app.js            ← Express app configuration
│   │
│   ├── models/           ← In-memory data storage
│   ├── controllers/      ← Business logic (handles requests)
│   ├── routes/           ← API endpoints
│   ├── middleware/       ← Custom middleware functions
│   └── utils/            ← Helper functions
│
├── .env                  ← Environment variables
└── package.json
```

This layered architecture separates concerns:
- **Routes** define endpoints
- **Controllers** process logic
- **Models** manage data

---

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Create a `.env` file in the root folder

```
PORT=3000
NODE_ENV=development
```

### 3. Start the development server

```bash
npm run dev
```

The server will start at `http://localhost:3000`

---

## API Design Overview

The API is designed around three main resources: **Users**, **Videos**, and **Comments**. Each resource has its own endpoints and follows RESTful conventions.

---

## User Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users` | Retrieve all users |
| POST | `/api/users` | Create a new user |
| GET | `/api/users/:id` | Retrieve a specific user |
| PUT | `/api/users/:id` | Update user details |
| DELETE | `/api/users/:id` | Delete a user |
| GET | `/api/users/:id/videos` | Get all videos by a user |
| GET | `/api/users/:id/followers` | Get followers list |
| GET | `/api/users/:id/following` | Get following list |

---

## Video Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/videos` | Retrieve all videos |
| POST | `/api/videos` | Upload a new video |
| GET | `/api/videos/:id` | Retrieve a specific video |
| PUT | `/api/videos/:id` | Update video details |
| DELETE | `/api/videos/:id` | Delete a video |
| GET | `/api/videos/:id/comments` | Get comments on a video |
| GET | `/api/videos/:id/likes` | Get likes on a video |

---

## Comment Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/comments` | Retrieve all comments |
| POST | `/api/comments` | Add a comment |
| GET | `/api/comments/:id` | Retrieve a specific comment |
| PUT | `/api/comments/:id` | Update a comment |
| DELETE | `/api/comments/:id` | Delete a comment |
| GET | `/api/comments/:id/likes` | Get likes on a comment |

---

## Data Handling Approach

This project uses an **in-memory data store**, meaning:
- Data is stored in JavaScript objects/arrays
- No external database is used
- Data resets every time the server restarts

This approach is useful for learning and testing API design without database complexity.

---

## Testing the API

### Using Browser
```
http://localhost:3000/api/users
```

### Using PowerShell
```powershell
iwr http://localhost:3000/api/users
```

### Using curl (Windows)
```bash
curl.exe http://localhost:3000/api/users
```

---

## Difficulties Faced & How I Overcame Them

### 1. Understanding the Modular Folder Structure

**Problem:**  
Coming from frontend development, the layered backend folder structure (models, controllers, routes, middleware) was unfamiliar. It was initially unclear which file was responsible for what and how they all connected to each other.

**Solution:**  
Breaking it down layer by layer helped — routes define *what URL* is hit, controllers define *what happens* when it is hit, and models define *what data* is involved. Once this mental model clicked, wiring them together became straightforward.

---

### 2. `req.body` Coming Through as `undefined`

**Problem:**  
When testing POST requests, the server could not read the data being sent — `req.body` was `undefined`.

**Cause:**  
The `body-parser` middleware had not been added to the Express app before the routes were registered.

**Solution:**  
Added the middleware in `app.js` before the route definitions:
```js
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
```

---

### 3. Routes Returning 404 Even When Defined

**Problem:**  
Some API endpoints were returning `404 Not Found` even though the route was clearly defined in the routes file.

**Cause:**  
The routes file was not being imported and mounted in `app.js`, so Express had no knowledge of those endpoints.

**Solution:**  
Made sure every routes file was imported and registered correctly in `app.js`:
```js
const userRoutes = require('./routes/userRoutes');
app.use('/api/users', userRoutes);
```

---

### 4. Nodemon Not Restarting on File Changes

**Problem:**  
After making changes to the code, the server was not automatically restarting, requiring a manual restart every time.

**Cause:**  
The dev script in `package.json` was using `node` instead of `nodemon`.

**Solution:**  
Updated the `scripts` section in `package.json`:
```json
"scripts": {
  "dev": "nodemon src/index.js"
}
```

---

## Limitations

- No database — data does not persist after server restart
- No authentication or authorization
- Limited input validation

---

## Future Improvements

- Integrate a database (MongoDB or PostgreSQL)
- Add authentication using JWT
- Implement actual file uploads for videos
- Improve input validation and error handling

---

## Conclusion

This project demonstrates the fundamentals of building a RESTful API using Node.js and Express. It highlights the importance of structured architecture, proper endpoint design, and separation of concerns.

By completing this practical, a foundational understanding of backend development and API communication is achieved, which can be extended to full-stack applications.