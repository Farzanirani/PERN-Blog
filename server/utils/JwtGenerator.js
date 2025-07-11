const jwt = require("jsonwebtoken")
require("dotenv").config()

function jwtGenerator(user){
    const payload = {
        id: user.id,
        username: user.username,
        role: user.role
    }

    return jwt.sign(payload, process.env.JWTSECRET , {expiresIn: "1h"})
}

module.exports = jwtGenerator