# Practical 6 Report — Token-Based Authentication in Node.js using JWT

| | |
|---|---|
| **Student Name** | Sonia Adhikari |
| **Student ID** | 02250371 |
| **Course** | WEB102 — Web Development / Backend Systems |
| **Practical** | Practical 6 — JWT Authentication |
| **Date** | 18 May 2026 |

---

## 1. Introduction

This practical focused on implementing token-based authentication in Node.js using JSON Web Tokens (JWT). The goal was to build a backend system that allows users to register, log in, and access protected routes using a signed token. This approach is widely used in modern web applications as it is more scalable than traditional session-based authentication.

---

## 2. Objectives

- Understand how token-based authentication works compared to session-based authentication
- Build a Register, Login, and Protected Route system using Node.js and Express
- Use JWT to sign and verify tokens
- Use bcrypt to securely hash passwords
- Test all API endpoints using Thunder Client in VS Code
- Complete the homework task: add a `name` field to registration and create a public `GET /users` route

---

## 3. Tools and Technologies Used

| Tool / Package | Purpose |
|----------------|---------|
| Node.js | JavaScript runtime environment |
| Express | HTTP server and routing |
| jsonwebtoken | Signing and verifying JWT tokens |
| bcryptjs | Hashing passwords securely |
| dotenv | Loading environment variables from `.env` |
| Thunder Client | Testing API endpoints inside VS Code |
| VS Code | Code editor and terminal |

---

## 4. Project Structure

```
node-token-auth/
├── server.js
├── .env
├── routes/
│   ├── auth.js
│   └── protected.js
└── middleware/
    └── verifyToken.js
```

---

## 5. How It Works

### 5.1 Authentication Flow

```
Client                             Server
  │                                  │
  │   POST /auth/register            │
  │ ──────────────────────────────►  │  Hashes password, saves user
  │   { message: "Registered!" }     │
  │ ◄──────────────────────────────  │
  │                                  │
  │   POST /auth/login               │
  │ ──────────────────────────────►  │  Verifies password, signs JWT
  │   { token: "eyJhbG..." }         │
  │ ◄──────────────────────────────  │
  │                                  │
  │   GET /profile                   │
  │   Authorization: Bearer token    │
  │ ──────────────────────────────►  │  Verifies token, returns data
  │   { user: { id, email } }        │
  │ ◄──────────────────────────────  │
```

### 5.2 What is a JWT?

A JSON Web Token has three parts separated by dots:

```
HEADER . PAYLOAD . SIGNATURE
```

| Part | Description |
|------|-------------|
| Header | Specifies the algorithm used (e.g. HS256) |
| Payload | Contains user data such as id, email, and expiry time |
| Signature | Proves the token was created by the server and has not been tampered with |

The payload is base64 encoded, not encrypted. This means anyone can read it. Sensitive information such as passwords should never be stored inside a JWT.

### 5.3 Why Hash Passwords?

Passwords are hashed using bcrypt before being stored. bcrypt is a one-way function, meaning even if the database is compromised, the original passwords cannot be recovered. An example of a bcrypt hash:

```
$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lLqq
```

---

## 6. API Endpoints

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| POST | `/auth/register` | No | Register a new user with name, email, and password |
| POST | `/auth/login` | No | Login and receive a JWT token |
| GET | `/profile` | Yes — Bearer token | Access protected user profile |
| GET | `/auth/users` | No | Get list of all users without passwords |

---

## 7. Test Results

All seven tests were carried out using Thunder Client in VS Code.

### Test 1 — Register with Name
- **Method:** POST `/auth/register`
- **Body:** `{ "email": "student@test.com", "password": "123456", "name": "Sonia Adhikari" }`
- **Status Received:** `201 Created`
- **Response:** `{ "message": "User registered successfully!" }`
- **Result:** ✅ Passed

### Test 2 — Login
- **Method:** POST `/auth/login`
- **Body:** `{ "email": "student@test.com", "password": "123456" }`
- **Status Received:** `200 OK`
- **Response:** `{ "message": "Login successful!", "token": "eyJhbG..." }`
- **Result:** ✅ Passed

### Test 3 — Access Profile WITH Token
- **Method:** GET `/profile`
- **Header:** `Authorization: Bearer <token>`
- **Status Received:** `200 OK`
- **Response:** `{ "message": "Welcome! You accessed a protected route.", "user": { "id": 1, "email": "student@test.com" } }`
- **Result:** ✅ Passed

### Test 4 — Access Profile WITHOUT Token
- **Method:** GET `/profile`
- **Header:** None
- **Status Received:** `401 Unauthorized`
- **Response:** `{ "message": "Access denied. No token provided." }`
- **Result:** ✅ Passed

### Test 5 — Access Profile With FAKE Token
- **Method:** GET `/profile`
- **Header:** `Authorization: Bearer thisisafaketoken`
- **Status Received:** `403 Forbidden`
- **Response:** `{ "message": "Invalid or expired token." }`
- **Result:** ✅ Passed

### Test 6 — Get All Users
- **Method:** GET `/auth/users`
- **Header:** None
- **Status Received:** `200 OK`
- **Response:** `[{ "id": 1, "email": "student@test.com", "name": "Sonia Adhikari" }]`
- **Result:** ✅ Passed

### Test 7 — Duplicate Email Registration
- **Method:** POST `/auth/register`
- **Body:** Same email as Test 1
- **Status Received:** `409 Conflict`
- **Response:** `{ "message": "User already exists." }`
- **Result:** ✅ Passed

---

## 8. HTTP Status Codes Summary

| Status Code | Meaning | When It Occurred |
|-------------|---------|-----------------|
| `201` | Created | User registered successfully |
| `200` | OK | Login or profile access succeeded |
| `400` | Bad Request | Missing email or password in body |
| `401` | Unauthorized | No token provided |
| `403` | Forbidden | Token was invalid or expired |
| `409` | Conflict | Email already registered |

---

## 9. Difficulties Faced and How I Overcame Them

### Difficulty 1 — "Cannot GET /" in the Browser

After running `node server.js` and seeing the server was running, I opened `http://localhost:3000` in the browser and saw the message **"Cannot GET /"**. I thought the server had an error or was not working correctly.

**How I overcame it:** After checking, I realised this message is completely normal. The application does not have a route defined for the homepage `/`. The browser only shows this because it tries to do a GET request on `/` by default. The actual API routes such as `/auth/register` and `/profile` were all working correctly. The correct way to test API endpoints is through **Thunder Client** inside VS Code, not through the browser.

---

### Difficulty 2 — Token Returning "Invalid or Expired Token"

When testing the protected `/profile` route in Thunder Client, I kept receiving a **403 Forbidden** response with the message `"Invalid or expired token."` even though I had pasted the token from the login response.

**How I overcame it:** The issue was with how the token was being sent in the Authorization header. The correct format requires the word `Bearer` followed by a single space and then the token, like this:

```
Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

I also learned that since the application stores users in memory (not a database), restarting the server clears all users and invalidates any existing tokens. The fix was to keep the server running without restarting, then register and login again to get a fresh token, and use that token immediately in the header.

---

## 10. Homework Task — Completed

The homework required two additions to the original tutorial code:

1. **Added `name` field to `/auth/register`** — the register endpoint now accepts `name` alongside `email` and `password`, and stores it in the user object.

2. **Added `GET /auth/users` route** — this public route returns all registered users showing only their `id`, `email`, and `name`. The password field is excluded using JavaScript's `map()` function to ensure sensitive data is never exposed.

Both additions were implemented inside `routes/auth.js` and tested successfully in Thunder Client.

---

## 11. Conclusion

This practical successfully demonstrated how token-based authentication works in a Node.js backend. I learned how to register and store users securely using bcrypt password hashing, generate and sign JWT tokens on login, protect routes using custom middleware that verifies tokens, and return safe user data without exposing passwords. The hands-on testing with Thunder Client made it clear how each HTTP status code maps to a different authentication scenario, and the difficulties I encountered helped me better understand how JWTs and in-memory storage behave in a real server environment.
