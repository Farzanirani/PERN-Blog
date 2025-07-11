const express = require("express")


function authorizeRole(...allowedRoles) {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json("Not authenticated");
        }

        if(!allowedRoles.includes(req.user.role)){
            return res.status(403).json("Not Permitted");
        }

        next()

    }
}

module.exports = authorizeRole;