# User Authentication & JWT

A full-stack user authentication system built with Node.js and Express. The application provides secure user registration, login, JWT-based authentication, protected routes, logout, and password reset through email using Resend.

## 🚀 Features

- User registration
- Secure password hashing with bcrypt
- User login and authentication
- JWT-based authentication
- HTTP-only JWT cookies
- Protected profile route
- User logout
- Forgot password functionality
- Secure password reset tokens
- Password reset token expiration
- Email delivery using Resend
- JSON-based user data storage
- Responsive frontend interface

## 🛠️ Technologies Used

### Frontend
- HTML5
- CSS3
- JavaScript

### Backend
- Node.js
- Express.js

### Authentication & Security
- JSON Web Token (JWT)
- bcryptjs
- HTTP-only cookies
- crypto-based password reset tokens

### Email
- Resend API

### Development
- Nodemon
- dotenv
- CORS

## 📁 Project Structure

```text
user-auth-jwt/
│
├── data/
│   └── users.json
│
├── middleware/
│   └── authMiddleware.js
│
├── public/
│   ├── login.html
│   ├── register.html
│   ├── profile.html
│   ├── forgot-password.html
│   ├── reset-password.html
│   ├── style.css
│   ├── script.js
│   └── profile.js
│
├── .env.example
├── .gitignore
├── nodemon.json
├── package.json
├── package-lock.json
├── README.md
└── server.js