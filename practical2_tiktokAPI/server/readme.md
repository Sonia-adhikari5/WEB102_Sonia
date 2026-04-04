#  TikTok REST API (WEB102 Practical 2)

##  Background
In modern web development, applications are typically divided into two main parts: the frontend and the backend. The frontend is responsible for what users see and interact with, while the backend handles data processing, storage, and communication between systems.

This project focuses on building a backend system using RESTful API principles. A REST API (Representational State Transfer Application Programming Interface) allows different systems to communicate over HTTP using standard methods such as GET, POST, PUT, and DELETE.

The goal of this practical is to simulate the backend of a TikTok-like application. This includes managing users, videos, and comments, as well as handling interactions such as likes and follows.

---

##  Objective
The main objective of this project is to design and implement a RESTful API using Node.js and Express. The API will:
- Handle multiple resources (Users, Videos, Comments)
- Support CRUD operations (Create, Read, Update, Delete)
- Follow RESTful design principles
- Serve as a backend for a frontend application (e.g., Next.js)

---

##  Technologies Used
This project is built using the following technologies:

- Node.js: JavaScript runtime environment for server-side development
- Express.js: Web framework used to build the API
- Nodemon: Automatically restarts the server during development
- dotenv: Manages environment variables securely
- body-parser: Parses incoming request bodies
- cors: Enables cross-origin resource sharing
- morgan: Logs HTTP requests for debugging

---

##  Project Architecture
The project follows a modular structure to improve maintainability and scalability. Each folder has a specific responsibility:
server/
│
├── src/
│ ├── index.js # Entry point (starts server)
│ ├── app.js # Express app configuration
│
│ ├── models/ # In-memory data storage
│ ├── controllers/ # Business logic (handles requests)
│ ├── routes/ # API endpoints
│ ├── middleware/ # Custom middleware functions
│ └── utils/ # Helper functions
│
├── .env # Environment variables
├── package.json


This layered architecture separates concerns:
- Routes define endpoints
- Controllers process logic
- Models manage data

---

##  Setup and Installation

### Step 1: Install dependencies
Run the following command in the server directory:

npm install


### Step 2: Configure environment variables
Create a `.env` file and define:
PORT=3000
NODE_ENV=development


### Step 3: Start the development server
npm run dev


The server will start at:
http://localhost:3000


---

##  API Design Overview

The API is designed around three main resources:
- Users
- Videos
- Comments

Each resource has its own endpoints and follows RESTful conventions.

---

##  User Endpoints

| Method | Endpoint | Description |
|--------|--------|-------------|
| GET | /api/users | Retrieve all users |
| POST | /api/users | Create a new user |
| GET | /api/users/:id | Retrieve a specific user |
| PUT | /api/users/:id | Update user details |
| DELETE | /api/users/:id | Delete a user |
| GET | /api/users/:id/videos | Get all videos by a user |
| GET | /api/users/:id/followers | Get followers list |
| GET | /api/users/:id/following | Get following list |

---

##  Video Endpoints

| Method | Endpoint | Description |
|--------|--------|-------------|
| GET | /api/videos | Retrieve all videos |
| POST | /api/videos | Upload a new video |
| GET | /api/videos/:id | Retrieve a specific video |
| PUT | /api/videos/:id | Update video details |
| DELETE | /api/videos/:id | Delete a video |
| GET | /api/videos/:id/comments | Get comments on a video |
| GET | /api/videos/:id/likes | Get likes on a video |

---

##  Comment Endpoints

| Method | Endpoint | Description |
|--------|--------|-------------|
| GET | /api/comments | Retrieve all comments |
| POST | /api/comments | Add a comment |
| GET | /api/comments/:id | Retrieve a specific comment |
| PUT | /api/comments/:id | Update a comment |
| DELETE | /api/comments/:id | Delete a comment |
| GET | /api/comments/:id/likes | Get likes on a comment |

---

##  Data Handling Approach

This project uses an **in-memory data store**, meaning:
- Data is stored in JavaScript objects/arrays
- No external database is used
- Data resets every time the server restarts

This approach is useful for learning and testing API design without database complexity.

---

##  Testing the API

### Using Browser
http://localhost:3000/api/users


### Using PowerShell
iwr http://localhost:3000/api/users


### Using curl (Windows)
curl.exe http://localhost:3000/api/users


---

##  Limitations
- No database (data is not persistent)
- No authentication or authorization
- Limited validation of input data

---

##  Future Improvements
- Integrate a database (MongoDB or PostgreSQL)
- Add authentication (JWT)
- Implement file uploads for videos
- Improve validation and error handling

---

##  Conclusion
This project demonstrates the fundamentals of building a RESTful API using Node.js and Express. It highlights the importance of structured architecture, proper endpoint design, and separation of concerns.

By completing this practical, a foundational understanding of backend development and API communication is achieved, which can be extended to full-stack applications.