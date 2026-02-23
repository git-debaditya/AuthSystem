const express = require("express");  //Express Router for modular route handling
const { z, ZodError } = require("zod"); //Zod for input validation and schema definition
const argon2 = require("argon2"); //Argon2 for secure password hashing and verification
const { pool } = require("../db.js");     //PostGres connection pool
const rateLimit = require('express-rate-limit');    //brute-force or prevent credential stuffing

//Create a new router instance
const router = express.Router();

//ZOD schema for validating registration input
const registrationSchema = z.object({
    email: z.string().email(), //email must be a valid email string
    password: z.string().min(8), //password must be at least 8 characters
});

//Registration Endpoint
router.post("/register", async (req, res) => {
    try {
        //Validate input against schema
        const { email, password } = registrationSchema.parse(req.body);
        //Hash the password using Argon2
        const hashedPassword = await argon2.hash(password);
        //Insert new user into the database
        const result = await pool.query(
            "INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email, role, created_at",
            [email, hashedPassword]
        );
        //Set session
        req.session.userId = result.rows[0].id;
        req.session.role = result.rows[0].role;
        return res.status(201).json({ message: "User registered successfully", user: result.rows[0] });
    } catch (err) {
        //Handle validation errors and other exceptions
        if (err instanceof ZodError) {
            return res.status(400).json({ error: err.errors }); //if ZOD fails
        }
        else if (err.code === "23505") { //PostGres unique violation error code
            return res.status(409).json({ error: "Account with this eMail already exists" });
        }
        //If any other error occurs, return a generic error response
        res.status(500).json({ error: "Internal server error" });
    }
});

//Rate Limiter
const loginLimiter = rateLimit({
        windowMs: 5 * 60 * 1000, // 5 minute
        limit: 5, // limit each IP to 5 requests per windowMs
        standardHeaders: true, // Return rate limit info in the `RateLimit` headers
        legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    });

//ZOD schema for validating login input
const loginSchema = z.object({
    email: z.string().email(), //email must be a valid email string
    password: z.string().min(8), //password must be at least 8 characters
});

//Login Endpoint
router.post("/login", loginLimiter, async (req, res) => {
    try {
        //Validate input against schema
        const {email, password } = loginSchema.parse(req.body);
        //Fetch user from database
        const result = await pool.query(
            "SELECT id, email, password_hash, role FROM users WHERE email = $1",
            [email]
        );
        const user = result.rows[0];
        if (!user) {
            return res.status(401).json({ error: "Invalid credentials" });
        }
        //Verify password using Argon2
        const validPassword = await argon2.verify(user.password_hash, password);
        if (!validPassword) {
            return res.status(401).json({ error: "Invalid credentials" });
        }
        //Set session (ONLY after successful login)
        req.session.userId = user.id;
        req.session.role = user.role;
        return res.status(200).json({ message: "Login successful", user: { id: user.id, email: user.email, role: user.role }});
    } catch (err) {
        //Handle validation errors and other exceptions
        if (err instanceof ZodError) {
            return res.status(400).json({ error: err.errors }); //if ZOD fails
        }
        //If any other error occurs, return a generic error response
        res.status(500).json({ error: "Internal server error" });
    }
})
module.exports = router;