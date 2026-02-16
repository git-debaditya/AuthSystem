const exp = require("express");  //Express Router for modular route handling
const inputValidation = require("zod"); //Zod for input validation and schema definition
const hash_pwd = require("argon2"); //Argon2 for secure password hashing and verification
const { v4: uuidv4 } = require("uuid"); //UUID for generating unique user IDs
const { pool } = require("../db");     //PostGres connection pool

//Create a new router instance
const router = exp.Router();

//ZOD schema for validating registration input
const registrationSchema = inputValidation.object({
    email: inputValidation.string().email(), //email must be a valid email string
    password: inputValidation.string().min(8), //password must be at least 8 characters
});

//Registration Endpoint
router.post("/register", async (req, res) => {
    try {
        //Validate input against schema
        const { email, password } = registrationSchema.parse(req.body);
        //Check if user already exists
        const existingUser = await pool.query("SELECT id FROM users WHERE email = $1", [email]);
        if (existingUser.rows.length > 0) {
            return res.status(400).json({ error: "User already exists" });
        }
        //Hash the password using Argon2
        const hashedPassword = await hash_pwd.hash(password);
        //Generate a unique user ID
        const userId = uuidv4();
        //Insert new user into the database
        const result = await pool.query(
            "INSERT INTO users (id, email, password) VALUES ($1, $2, $3) RETURNING id, email, role, created_at",
            [userId, email, hashedPassword]
        );
        //Set session
        req.session.userId = result.rows[0].id;
        req.session.userRole = result.rows[0].role;
        return res.status(201).json({ message: "User registered successfully", user: result.rows[0] });
    } catch (err) {
        //Handle validation errors and other exceptions
        if (err instanceof inputValidation.ZodError) {
            return res.status(400).json({ error: err.errors }); //if ZOD fails
        }
        else if (err.code === "23505") { //PostGres unique violation error code
            return res.status(409).json({ error: "Account with this eMail already exists" });
        }
        //If any other error occurs, return a generic error response
        res.status(500).json({ error: "Internal server error" });
    }
});

module.exports = router;