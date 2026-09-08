const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { Resend } = require("resend");

require("dotenv").config();

const app = express();

const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET;

const resend = new Resend(process.env.RESEND_API_KEY);

const usersFile = path.join(__dirname, "data", "users.json");


// ==========================================
// MIDDLEWARE
// ==========================================

app.use(express.json());

app.use(cookieParser());

app.use(cors({
    origin: true,
    credentials: true
}));


// ==========================================
// SERVE FRONTEND
// ==========================================

app.use(express.static(path.join(__dirname, "public")));


// ==========================================
// USER FILE FUNCTIONS
// ==========================================

function getUsers() {
    return JSON.parse(
        fs.readFileSync(usersFile, "utf8")
    );
}

function saveUsers(users) {
    fs.writeFileSync(
        usersFile,
        JSON.stringify(users, null, 2)
    );
}


// ==========================================
// AUTH MIDDLEWARE
// ==========================================

const authenticateToken = require("./middleware/authMiddleware");


// ==========================================
// REGISTER
// ==========================================

app.post("/api/auth/register", async (req, res) => {

    try {

        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                message: "Name, email and password are required"
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                message: "Password must be at least 6 characters"
            });
        }

        const users = getUsers();

        const existingUser = users.find(
            user => user.email.toLowerCase() === email.toLowerCase()
        );

        if (existingUser) {
            return res.status(409).json({
                message: "User already exists"
            });
        }

        const hashedPassword = await bcrypt.hash(
            password,
            10
        );

        const newUser = {
            id: Date.now().toString(),
            name: name,
            email: email.toLowerCase(),
            password: hashedPassword
        };

        users.push(newUser);

        saveUsers(users);

        res.status(201).json({
            message: "User registered successfully"
        });

    } catch (error) {

        console.error("Register error:", error);

        res.status(500).json({
            message: "Server error"
        });

    }

});


// ==========================================
// LOGIN
// ==========================================

app.post("/api/auth/login", async (req, res) => {

    try {

        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required"
            });
        }

        const users = getUsers();

        const user = users.find(
            user => user.email === email.toLowerCase()
        );

        if (!user) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        const passwordMatch = await bcrypt.compare(
            password,
            user.password
        );

        if (!passwordMatch) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        const token = jwt.sign(
            {
                id: user.id,
                email: user.email
            },
            JWT_SECRET,
            {
                expiresIn: "1h"
            }
        );

        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 60 * 60 * 1000
        });

        res.json({
            message: "Login successful"
        });

    } catch (error) {

        console.error("Login error:", error);

        res.status(500).json({
            message: "Server error"
        });

    }

});


// ==========================================
// HOME / API STATUS
// ==========================================

app.get("/", (req, res) => {

    res.json({
        message: "User Authentication API is running"
    });

});


// ==========================================
// PROTECTED PROFILE
// ==========================================

app.get("/api/profile", authenticateToken, (req, res) => {

    try {

        const users = getUsers();

        const user = users.find(
            user => user.id === req.user.id
        );

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        res.json({
            message: "Protected profile data",

            user: {
                id: user.id,
                name: user.name,
                email: user.email
            }
        });

    } catch (error) {

        console.error("Profile error:", error);

        res.status(500).json({
            message: "Server error"
        });

    }

});


// ==========================================
// LOGOUT
// ==========================================

app.post("/api/auth/logout", (req, res) => {

    res.clearCookie("token");

    res.json({
        message: "Logged out successfully"
    });

});


// ==========================================
// FORGOT PASSWORD
// ==========================================

app.post("/api/auth/forgot-password", async (req, res) => {

    try {

        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                message: "Email is required"
            });
        }

        const users = getUsers();

        const user = users.find(
            user => user.email === email.toLowerCase()
        );

        if (!user) {
            return res.json({
                message: "If the email exists, a reset link has been generated."
            });
        }

        // Generate reset token
        const resetToken = crypto
            .randomBytes(32)
            .toString("hex");

        // Save token and expiry
        user.resetToken = resetToken;

        user.resetTokenExpiry =
            Date.now() + 15 * 60 * 1000;

        saveUsers(users);

        // Reset password link
        const resetLink =
            `http://localhost:5000/reset-password.html?token=${resetToken}`;

        console.log(
            "Sending reset email to:",
            user.email
        );

        // Send email using Resend
        const { data, error } =
            await resend.emails.send({

                from: "onboarding@resend.dev",

                to: user.email,

                subject: "Reset Your Password",

                html: `
                    <h2>Password Reset</h2>

                    <p>Hello ${user.name},</p>

                    <p>
                        We received a request to reset your password.
                    </p>

                    <p>
                        <a href="${resetLink}">
                            Click here to reset your password
                        </a>
                    </p>

                    <p>
                        This link will expire in 15 minutes.
                    </p>

                    <p>
                        If you did not request this,
                        you can safely ignore this email.
                    </p>
                `
            });

        console.log(
            "Resend response:",
            data
        );

        console.log(
            "Resend error:",
            error
        );

        if (error) {
            return res.status(500).json({
                message: "Unable to send reset email"
            });
        }

        res.json({
            message: "If the email exists, a reset link has been sent."
        });

    } catch (error) {

        console.error(
            "Forgot password error:",
            error
        );

        res.status(500).json({
            message: "Server error"
        });

    }

});


// ==========================================
// RESET PASSWORD
// ==========================================

app.post("/api/auth/reset-password", async (req, res) => {

    try {

        const { token, password } = req.body;

        if (!token || !password) {
            return res.status(400).json({
                message: "Token and password are required"
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                message: "Password must be at least 6 characters"
            });
        }

        const users = getUsers();

        // Find user with valid reset token
        const user = users.find(
            user =>
                user.resetToken === token &&
                user.resetTokenExpiry > Date.now()
        );

        if (!user) {
            return res.status(400).json({
                message: "Invalid or expired reset token"
            });
        }

        // Hash new password
        const hashedPassword =
            await bcrypt.hash(password, 10);

        user.password = hashedPassword;

        // Delete reset token after use
        delete user.resetToken;

        delete user.resetTokenExpiry;

        saveUsers(users);

        res.json({
            message: "Password reset successfully"
        });

    } catch (error) {

        console.error(
            "Reset password error:",
            error
        );

        res.status(500).json({
            message: "Server error"
        });

    }

});


// ==========================================
// START SERVER
// ==========================================

app.listen(PORT, () => {

    console.log(
        `Server running on http://localhost:${PORT}`
    );

});