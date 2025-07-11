const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const pool = require("./db");
const jwt = require("jsonwebtoken");
const { preferences } = require("joi");
require("dotenv").config();

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/api/auth/google/callback",
}, async (accessToken, refreshToken, profile, done) => {
    try {
        const email = profile.emails[0].value
        const username = profile.displayName

        // check if user exists
        const userRes = await pool.query("SELECT * FROM users WHERE email = $1", [email])

        let user;

        if (userRes.rows.length === 0) {
            // Adding new user to the DB

            const newUserRes = await pool.query("INSERT INTO users (username, email, role) VALUES ($1, $2, $3) RETURNING *", [username, email, "user"])

            user = newUserRes.rows[0]
        }
        else {
            user = userRes.rows[0]
        }
        done(null, user)

    } catch (error) {
        console.error("Google Strategy Error:", error.message);
        done(error, null)
    }
}))