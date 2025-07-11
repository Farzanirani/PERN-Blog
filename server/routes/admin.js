const pool = require("../db")
const authorizeRole = require("../middlewares/authorizeRole")
const verifyToken = require("../middlewares/verifyToken")
const Roles = require("../utils/Roles")

const router = require("express").Router()


// /api/admin

router.get("/users", verifyToken, authorizeRole("admin"), async (req, res) => {
    try {
        // const adminId = req.user.id

        const users = await pool.query("SELECT id, username, email, role, created_at FROM users ORDER BY created_at DESC")

        if (users.rows.length === 0) {
            return res.status(404).json("No users")
        }

        res.status(200).json(users.rows)

    } catch (error) {
        console.error(error)
        res.status(500).json("Server Error")
    }
})


router.put("/users/:id/role", verifyToken, authorizeRole("admin"), async (req, res) => {
    try {
        const selfId = req.user.id

        const userId = parseInt(req.params.id)

        const {role} = req.body

        if (![Roles.USER, Roles.MODERATOR, Roles.ADMIN].includes(role)) {
            return res.status(400).json("Invalid role");
        }

        if (userId === selfId) {
            return res.status(403).json("You cannot change your own role")
        }

        const updRole = await pool.query("UPDATE users SET role = $1 WHERE id = $2 RETURNING id, username, role", [role, userId])

        if (updRole.rows.length === 0) {
            return res.status(404).json("User Not Found")
        }

        res.json({ message: "User role updated", user: updRole.rows[0] });

    } catch (error) {
        console.error(error)
        res.status(500).json("Server Error")
    }
})

// DELETE /api/admin/users/:id
router.delete("/users/:id", verifyToken, authorizeRole("admin"), async (req, res) => {
    try {
        const selfId = req.user.id;
        const userId = parseInt(req.params.id);

        if (userId === selfId) {
            return res.status(403).json("You cannot delete yourself");
        }

        const deletedUser = await pool.query("DELETE FROM users WHERE id = $1 RETURNING id, username", [userId]);

        if (deletedUser.rows.length === 0) {
            return res.status(404).json("User not found");
        }

        res.json({ message: "User deleted successfully", user: deletedUser.rows[0] });
    } catch (error) {
        console.error(error.message);
        res.status(500).json("Server Error");
    }
});


module.exports = router