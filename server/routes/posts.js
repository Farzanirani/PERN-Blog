const router = require("express").Router()
const { boolean } = require("joi")
const pool = require("../db")
const authorizeRole = require("../middlewares/authorizeRole")
const verifyToken = require("../middlewares/verifyToken")
const Roles = require("../utils/Roles")


// /api/posts

router.get("/", async (req, res) => {
    try {
        const allPosts = await pool.query("SELECT p.id, p.title, p.content, p.created_at, p.user_id, p.header_image, u.username FROM posts AS p JOIN users AS u ON p.user_id = u.id ORDER BY p.created_at DESC")

        res.json(allPosts.rows)

    } catch (error) {
        console.error(error.message)
        res.status(500).json("Server Error")
    }

})

router.get("/:id", async (req, res) => {
    const postId = req.params.id;

    try {
        const post = await pool.query(`SELECT p.*, u.username FROM posts p JOIN users u ON p.user_id = u.id WHERE p.id = $1`, [postId]);

        if (post.rows.length === 0) {
            return res.status(404).json("Post not found");
        }

        res.json(post.rows[0]);

    } catch (err) {
        console.error(err.message);
        res.status(500).json("Server error");
    }
});

router.get("/user/:id", verifyToken, async (req, res) => {
    try {
        const { id } = req.params;

        const posts = await pool.query("SELECT p.id, p.title, p.content, p.created_at, p.user_id, p.header_image, u.username FROM posts p JOIN users u ON p.user_id = u.id WHERE p.user_id = $1 ORDER BY p.created_at DESC", [id]);

        res.json(posts.rows);
    } catch (error) {
        console.error("Error fetching user's posts:", error.message);
        res.status(500).json("Server Error");
    }
});

router.post("/", verifyToken, async (req, res) => {
    try {
        const { title, content, header_image } = req.body
        const user_id = req.user.id
        const newPost = await pool.query("INSERT INTO posts (title, content, user_id, header_image) VALUES ($1, $2, $3, $4) RETURNING *", [title, content, user_id, header_image])

        if (newPost.rows.length === 0) {
            return res.status(500).json("Failed to create a new post")
        }

        res.status(201).json(newPost.rows[0]);

    } catch (error) {
        console.error(error.message)
        res.status(500).json("Server Error")
    }

})

router.put("/:id", verifyToken, async (req, res) => {
    try {

        const { title, content } = req.body
        const { id, role } = req.user

        const postId = req.params.id

        const post = await pool.query("SELECT * FROM posts WHERE id = $1", [postId])

        if (post.rows.length === 0) {
            return res.status(404).json("Post not found")
        }

        const postOwnerId = post.rows[0].user_id

        if (role === Roles.ADMIN || id === postOwnerId) {
            const updatedPost = await pool.query(
                `UPDATE posts SET title = $1, content = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING *`,
                [title, content, postId]
            );
            res.json(updatedPost.rows[0]);
        }
        else {
            return res.status(403).json("You can only edit your own posts");
        }

    } catch (error) {
        console.error(error.message)
        res.status(500).json("Server Error")
    }
})


router.delete("/:id", verifyToken, async (req, res) => {

    try {
        const postId = req.params.id
        const { id, role } = req.user

        const post = await pool.query("SELECT * FROM posts WHERE id = $1", [postId])

        if (post.rows.length === 0) {
            res.status(404).json("Post not found")
        }

        const postOwnerId = post.rows[0].user_id;


        if (role === Roles.ADMIN || role === Roles.MODERATOR || id === postOwnerId) {

            const deletedPost = await pool.query("DELETE from posts WHERE id = $1 RETURNING *", [postId])
            res.json({ message: "Post deleted", post: deletedPost.rows[0] });
        }
        else {
            return res.status(403).json("You cannot delete this post");
        }


    } catch (error) {
        console.error(error.message)
        res.status(500).json("Server Error")
    }

})


router.post("/:id/likes", verifyToken, async (req, res) => {
    const postId = parseInt(req.params.id)
    const userId = req.user.id
    const { liked } = req.body

    if (typeof liked !== 'boolean') return res.status(400).json("Liked must be true or false");

    try {

        const owner = await pool.query("SELECT user_id FROM posts WHERE id = $1", [postId])
        if (owner.rows.length === 0) {
            return res.status(404).json("Post not found!")
        }

        if (owner.rows[0].user_id === userId) {
            return res.status(403).json("You cannot like or dislike your own posts!")
        }

        const existing = await pool.query("SELECT * from post_likes WHERE post_id = $1 AND user_id = $2", [postId, userId])

        if (existing.rows.length === 0) {
            await pool.query("INSERT INTO post_likes (user_id, post_id, liked) VALUES ($1, $2, $3)", [userId, postId, liked])
        }
        else {
            await pool.query("UPDATE post_likes SET liked = $1 WHERE post_id = $2 AND user_id = $3", [liked, postId, userId])
        }

        res.json("Like/dislike saved");

    } catch (error) {
        console.error(error.message + "Error in adding likes/dislikes")
        return res.status(500).json("Server Error!")
    }
})

router.get("/:id/likes", verifyToken, async (req, res) => {
    const postId = parseInt(req.params.id)
    const userId = req.user.id

    try {

        const likes = await pool.query("SELECT COUNT(*) FROM post_likes WHERE post_id = $1 AND liked = true", [postId])
        const dislikes = await pool.query("SELECT COUNT(*) FROM post_likes WHERE post_id = $1 AND liked = false", [postId])
        const userReaction = await pool.query("SELECT liked FROM post_likes WHERE user_id = $1 AND post_id = $2", [userId, postId])

        res.json({
            likes: parseInt(likes.rows[0].count),
            dislikes: parseInt(dislikes.rows[0].count),
            userReaction: userReaction.rows[0]?.liked ?? null
        });

    } catch (error) {
        console.error(error.message + "Error in fetching likes/dislikes")
        return res.status(500).json("Server Error!")
    }
})

module.exports = router