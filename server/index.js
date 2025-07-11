const express = require("express")
const cors = require("cors")
require("dotenv").config()
const session = require("express-session");
const passport = require("passport");
require("./passportSetup") // import passport setup

const app = express()

app.use(express.json())
app.use(cors())

// session middleware (required for passport)
app.use(session({secret: "secret", resave: false, saveUninitialized: true}))
app.use(passport.initialize())
app.use(passport.session())

// for serializing user into session (not used much since we use JWT)
passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));


// Routes
app.use("/api/posts", require("./routes/posts"))
app.use("/api/auth", require("./routes/auth"))
app.use("/api/admin", require("./routes/admin"))
app.use("/api/comments", require("./routes/comments"));


const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
    console.log(`Server is running on PORT ${PORT}`)
})