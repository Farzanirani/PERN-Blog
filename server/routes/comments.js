const router = require("express").Router()
const { boolean } = require("joi")
const pool = require("../db")
const authorizeRole = require("../middlewares/authorizeRole")
const verifyToken = require("../middlewares/verifyToken")
const Roles = require("../utils/Roles")

// Fetch all comments + replies for a post
router.get("/:postId", async (req, res) => {
    const postId = req.params.postId

    try {
        const comments = await pool.query("SELECT c.*, u.username FROM comments AS c JOIN users AS u ON c.user_id = u.id WHERE c.post_id = $1 ORDER BY c.created_at ASC", [postId])
        res.json(comments.rows);

    } catch (error) {
        console.error(error.message)
        res.status(500).json("Server error");
    }
})

// Post a new comment or reply
router.post("/:postId", verifyToken, async(req, res) => {
    const postId = req.params.postId
    const userId = req.user.id
    const { content, parent_id = null } = req.body

    if (!content.trim()) return res.status(400).json("Content required");

    try {

        const result = await pool.query("INSERT INTO comments (user_id, post_id, content, parent_id) VALUES ($1, $2, $3, $4)", [userId, postId, content, parent_id])
        res.status(201).json(result.rows[0]);

    } catch (error) {
        console.error(error.message)
        res.status(500).json("Server error")
    }
})

// DELETE /api/comments/:commentId
router.delete("/:commentId", verifyToken, async (req, res) => {
  const { commentId } = req.params;
  const { id: userId, role } = req.user;

  try {
    const result = await pool.query("SELECT * FROM comments WHERE id = $1", [commentId]);
    if (result.rows.length === 0) {
      return res.status(404).json("Comment not found");
    }

    const comment = result.rows[0];

    // Check if the user is the owner or has admin/mod role
    if (comment.user_id !== userId && role !== "admin" && role !== "moderator") {
      return res.status(403).json("Not authorized to delete this comment");
    }

    await pool.query("DELETE FROM comments WHERE id = $1", [commentId]);

    res.json({ message: "Comment deleted" });
  } catch (error) {
    console.error("Error deleting comment:", error.message);
    res.status(500).json("Server Error");
  }
});


module.exports = router