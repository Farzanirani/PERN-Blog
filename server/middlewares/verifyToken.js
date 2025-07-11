const express = require("express")
const jwt =  require("jsonwebtoken")
require("dotenv").config()

function verifyToken(req, res, next){
    
    const token = req.headers.token

    if (!token) return res.status(401).json("No token, access denied");
     try {
         const payload = jwt.verify(token, process.env.JWTSECRET)
        req.user = payload
        next()

     } catch (error) {
        console.error(error.message)
        return res.status(403).json("Invalid token");
     }

}


module.exports = verifyToken