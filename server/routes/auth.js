const router = require("express").Router()
const pool = require("../db")
const bcrypt = require("bcrypt")
const jwtGenerator = require("../utils/JwtGenerator")
const { signupSchema, loginSchema } = require("../utils/Validators");
const passport = require("passport");
const jwt = require("jsonwebtoken");

// /api/auth

// Initiates Google OAuth2 login
router.get("/google", passport.authenticate("google", {scope: ["profile", "email"]}))

// Callback after Google login
router.get("/google/callback", passport.authenticate("google", {session: false}), (req, res)=>{
    const user = req.user
    const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, process.env.JWTSECRET, { expiresIn: "1h" })

    // Redirect to frontend with token in URL
    res.redirect(`http://localhost:5173/google-success?token=${token}`);
})

router.post("/signup", async (req, res) => {
    try {
        const { error } = signupSchema.validate(req.body)
        if (error) {
            return res.status(400).json(error.details[0].message)
        }
        const { username, email, password } = req.body


        const checkUser = await pool.query("SELECT * FROM users WHERE email = $1 OR username = $2", [email, username])

        // Check if user already exists

        if (checkUser.rows.length > 0) {
            return res.status(401).json("User already exists!")
        }

        // hash password

        const salt = await bcrypt.genSalt(10)
        const hashpassword = await bcrypt.hash(password, salt)

        // Add the user in database

        const newUser = await pool.query("INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING *", [username, email, hashpassword])

        // res.json(newUser.rows[0])

        if (newUser.rows.length === 0) {
            return res.status(401).json("Registration failed!")
        }

        // Create JWT Token

        const token = jwtGenerator(newUser.rows[0])
        res.json({ token })

    } catch (error) {
        console.error(error.message)
        res.status(500).json("Server error!");

    }
})

router.post("/login", async (req, res) => {
    try {
        const { error } = loginSchema.validate(req.body);
        if (error) return res.status(400).json(error.details[0].message);

        const { email, password } = req.body
        const user = await pool.query("SELECT * FROM users WHERE email = $1", [email])

        // Check if user has registered

        if (user.rows.length === 0) {
            return res.status(401).json("Invalid credentials")
        }

        // Check Password

        const checkPassword = await bcrypt.compare(password, user.rows[0].password)

        if (!checkPassword) {
            return res.status(401).json("Invalid credentials")
        }

        // generate JWT Token

        const token = jwtGenerator(user.rows[0])
        res.json({ token })

    } catch (error) {
        console.error(error.message)
        res.status(500).json("Server error!");
    }

})

module.exports = router