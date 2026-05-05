# WEB102 — Practical 4: Connecting TikTok to PostgreSQL with Prisma ORM

**Student:** Sonia Adhikari  
**Module:** WEB102 — Backend Web Development  
**Date:** May 2026

---

## Objective

The goal of this practical was to migrate the TikTok REST API (built in Practical 2) from in-memory data storage to a real persistent database using PostgreSQL and Prisma ORM. This involved:

- Setting up a PostgreSQL database for the TikTok clone application
- Configuring Prisma ORM to interact with the database
- Migrating from in-memory data models to persistent database storage
- Implementing authentication with password encryption using bcrypt and JWT
- Updating all RESTful API endpoints to use the database

---

## Technologies Used

| Package | Purpose |
|--------|---------|
| `postgresql` | Relational database for persistent data storage |
| `prisma` | ORM for defining schema, running migrations, and querying the database |
| `@prisma/client` | Auto-generated database client used in controllers |
| `bcrypt` | Hashes passwords before storing them in the database |
| `jsonwebtoken` | Generates and verifies JWT tokens for authentication |
| `express` | Web server framework |
| `nodemon` | Automatically restarts the server on file changes |
| `dotenv` | Manages environment variables |
| `cors` | Enables cross-origin requests |
| `morgan` | HTTP request logger |

---

## Project Structure

```
practical4/server/
│
├── prisma/
│   ├── schema.prisma       ← Database schema (models & relationships)
│   ├── seed.js             ← Script to populate database with test data
│   └── migrations/         ← Auto-generated SQL migration files
│
├── src/
│   ├── index.js            ← Entry point
│   ├── app.js              ← Express app configuration & routes
│   │
│   ├── lib/
│   │   └── prisma.js       ← Prisma client instance
│   │
│   ├── controllers/
│   │   ├── userController.js
│   │   ├── videoController.js
│   │   └── commentController.js
│   │
│   ├── routes/
│   │   ├── userRoutes.js
│   │   ├── videoRoutes.js
│   │   └── commentRoutes.js
│   │
│   └── middleware/
│       └── auth.js         ← JWT authentication middleware
│
├── .env                    ← Environment variables
└── package.json
```

---

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Set up PostgreSQL

Access the PostgreSQL command line and run:

```sql
CREATE DATABASE tiktok_db;
CREATE USER tiktok_user WITH ENCRYPTED PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE tiktok_db TO tiktok_user;
\q
```

### 3. Configure `.env`

```
PORT=5000
NODE_ENV=development
DATABASE_URL="postgresql://tiktok_user:your_password@localhost:5432/tiktok_db?schema=public"
JWT_SECRET=yourverylongandsecurerandomsecret
JWT_EXPIRE=30d
```

### 4. Run Prisma migration

```bash
npx prisma migrate dev --name init
```

### 5. Seed the database

```bash
npm run seed
```

This populates the database with:
- 10 users
- 50 videos (5 per user)
- 200 comments
- 300 video likes
- 40 follow relationships

### 6. Start the server

```bash
npm run dev
```

Server runs at `http://localhost:5000`

---

## API Endpoints

### Authentication

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/users/register` | Public | Register a new user |
| POST | `/api/users/login` | Public | Login and receive JWT token |

### Users

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/users` | Public | Get all users |
| GET | `/api/users/:id` | Public | Get a specific user |
| PUT | `/api/users/:id` | Protected | Update user details |
| DELETE | `/api/users/:id` | Protected | Delete a user |
| GET | `/api/users/:id/videos` | Public | Get all videos by a user |
| GET | `/api/users/:id/followers` | Public | Get user's followers |
| GET | `/api/users/:id/following` | Public | Get user's following list |

### Videos

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/videos` | Public | Get all videos |
| POST | `/api/videos` | Protected | Upload a new video |
| GET | `/api/videos/:id` | Public | Get a specific video |
| PUT | `/api/videos/:id` | Protected | Update video details |
| DELETE | `/api/videos/:id` | Protected | Delete a video |
| GET | `/api/videos/:id/comments` | Public | Get video comments |
| GET | `/api/videos/:id/likes` | Public | Get video likes |
| POST | `/api/videos/:id/likes` | Protected | Like or unlike a video |

### Comments

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/comments` | Public | Get all comments |
| POST | `/api/comments` | Protected | Add a comment |
| GET | `/api/comments/:id` | Public | Get a specific comment |
| PUT | `/api/comments/:id` | Protected | Update a comment |
| DELETE | `/api/comments/:id` | Protected | Delete a comment |
| GET | `/api/comments/:id/likes` | Public | Get comment likes |
| POST | `/api/comments/:id/likes` | Protected | Like or unlike a comment |

> **Protected** routes require a `Authorization: Bearer <token>` header.

---

## Authentication Flow

1. Register or login to receive a JWT token
2. Include the token in the `Authorization` header for protected routes:
```
Authorization: Bearer YOUR_TOKEN_HERE
```
3. The `auth.js` middleware verifies the token and attaches the user to `req.user`

---

## Key Concepts Learned

### PostgreSQL & Relational Databases
PostgreSQL is a relational database that stores data in tables with rows and columns. Unlike the in-memory approach from Practical 2, data persists after the server restarts. Tables are connected through foreign keys which maintain data integrity.

### Prisma ORM
Prisma acts as a bridge between the Node.js application and the PostgreSQL database. Instead of writing raw SQL, models are defined in `schema.prisma` and Prisma generates a fully typed client for querying the database. Migrations track schema changes over time.

### Password Hashing with bcrypt
Passwords are never stored as plain text. `bcrypt.hash()` converts the password into an irreversible hash before saving. On login, `bcrypt.compare()` checks if the entered password matches the stored hash.

### JWT Authentication
JSON Web Tokens are used for stateless authentication. After login, a signed token is returned to the client. The client sends this token in the `Authorization` header on every protected request. The server verifies the token using the `JWT_SECRET` without needing to query the database each time.

### Prisma Schema Relationships
The schema defines how models relate to each other. For example a `User` has many `Videos`, a `Video` has many `Comments`, and follows are a self-referencing many-to-many relationship on the `User` model.

---

## Difficulties Faced & How I Overcame Them

### 1. `package.json` Syntax Error — Missing Comma

**Problem:**  
After manually editing `package.json` to add the seed script, the server would not start and npm commands threw errors.

**Cause:**  
A comma was missing after the closing `}` of the `scripts` block. JSON is very strict about syntax — a single missing comma breaks the entire file.

**The broken code:**
```json
{
  "scripts": {
    "dev": "nodemon src/index.js",
    "seed": "node prisma/seed.js"
  }               ← missing comma here
  "dependencies": {
    ...
  }
}
```

**Solution:**  
Added the missing comma after the scripts block and restructured the entire `package.json` properly:
```json
{
  "scripts": {
    "dev": "nodemon src/index.js",
    "start": "node src/index.js",
    "seed": "node prisma/seed.js"
  },              ← comma added
  "dependencies": { ... }
}
```

---

### 2. `nodemon` Not Recognized

**Problem:**  
Running `npm run dev` produced this error:
```
'nodemon' is not recognized as an internal or external command,
operable program or batch file.
```

**Cause:**  
`nodemon` was listed in `package.json` under `devDependencies` but had not actually been installed yet. The `node_modules` folder did not contain it.

**Solution:**  
Installed nodemon explicitly:
```bash
npm install nodemon --save-dev
```
Then `npm run dev` worked correctly.

---

## Testing the API with Postman

### Register a user
- **Method:** `POST`
- **URL:** `http://localhost:5000/api/users/register`
- **Body (JSON):**
```json
{
  "username": "testuser",
  "email": "test@example.com",
  "password": "password123",
  "name": "Test User"
}
```

### Login
- **Method:** `POST`
- **URL:** `http://localhost:5000/api/users/login`
- **Body (JSON):**
```json
{
  "email": "test@example.com",
  "password": "password123"
}
```
Copy the `token` from the response.

### Create a video (protected)
- **Method:** `POST`
- **URL:** `http://localhost:5000/api/videos`
- **Header:** `Authorization: Bearer YOUR_TOKEN_HERE`
- **Body (JSON):**
```json
{
  "title": "My First Video",
  "description": "Testing the API",
  "url": "https://example.com/video.mp4"
}
```

---

## Limitations

- No actual video file storage (URLs are stored as strings only)
- JWT tokens cannot be invalidated before expiry (no logout mechanism)
- No pagination on list endpoints

---

## Future Improvements

- Add pagination to all list endpoints
- Implement token blacklisting for logout
- Integrate actual file storage (e.g. AWS S3) for video uploads
- Add input validation middleware (e.g. Joi or Zod)
- Write automated tests with Jest

---

## References

- [Prisma Documentation](https://www.prisma.io/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs)
- [JWT Authentication](https://jwt.io)
- GitHub Reference: [https://github.com/syangche/TikTok_Server.git](https://github.com/syangche/TikTok_Server.git)
