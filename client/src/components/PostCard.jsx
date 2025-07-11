import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import axios from 'axios';
import { toast } from 'react-toastify';

function PostCard({ post, canEdit, canDelete, onDelete }) {
    const { token, user } = useAuth();
    const [likes, setLikes] = useState(0);
    const [dislikes, setDislikes] = useState(0);
    const [userReaction, setUserReaction] = useState(null);

    const isOwner = user && user.id === post.user_id;

    useEffect(() => {
        fetchReactions();
    }, []);

    async function fetchReactions() {
        try {
            const res = await axios.get(`http://localhost:5000/api/posts/${post.id}/likes`, {
                headers: { token }
            });
            setLikes(res.data.likes);
            setDislikes(res.data.dislikes);
            setUserReaction(res.data.userReaction);
        } catch (error) {
            console.error("Error fetching reactions", error.message);
        }
    }

    async function handleReact(reaction) {
        try {
            await axios.post(`http://localhost:5000/api/posts/${post.id}/likes`, {
                liked: reaction
            }, {
                headers: { token }
            });
            fetchReactions();
        } catch (error) {
            console.error("Reaction failed", error.message);
            toast.error("Could not submit reaction");
        }
    }

    async function handleDelete() {
        const confirmed = window.confirm("Are you sure you want to delete this post?");
        if (!confirmed) return;

        try {
            await axios.delete(`http://localhost:5000/api/posts/${post.id}`, {
                headers: { token },
            });
            toast.success("Post deleted successfully!");
            if (onDelete) onDelete(post.id);
        } catch (error) {
            console.error("Failed to delete post", error);
            toast.error("Could not delete the post.");
        }
    }

    // Helper to remove all HTML tags
    function stripHtmlTags(html) {
        const div = document.createElement('div');
        div.innerHTML = html;
        return div.textContent || div.innerText || '';
    }


    return (
        <div className="border p-4 rounded mb-4 shadow flex gap-4 items-start">
            {post.header_image && (
                <img
                    src={post.header_image}
                    alt="thumbnail"
                    className="w-24 h-24 object-cover rounded"
                />
            )}

            <div className="flex-1">
                <h3 className="text-xl font-bold">{post.title}</h3>

                <p className="text-gray-600 text-sm line-clamp-2">
                    {stripHtmlTags(post.content)}
                </p>


                <p className="text-sm text-gray-500 mt-1">By: {post.username}</p>

                <div className="flex gap-3 mt-2">
                    <Link to={`/post/${post.id}`} className="text-blue-500 underline">View</Link>
                    {canEdit && <Link to={`/edit/${post.id}`} className="text-green-600">Edit</Link>}
                    {canDelete && (
                        <button onClick={handleDelete} className="text-red-500 hover:cursor-pointer">
                            Delete
                        </button>
                    )}
                </div>

                <div className="flex items-center gap-3 mt-3">
                    <button
                        onClick={() => handleReact(true)}
                        disabled={isOwner}
                        className={`px-2 py-1 rounded transition ${userReaction === true ? "text-blue-600 font-bold" : ""} ${isOwner ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-100 cursor-pointer"}`}
                    >
                        👍 {likes}
                    </button>

                    <button
                        onClick={() => handleReact(false)}
                        disabled={isOwner}
                        className={`px-2 py-1 rounded transition ${userReaction === false ? "text-red-600 font-bold" : ""} ${isOwner ? "opacity-50 cursor-not-allowed" : "hover:bg-red-100 cursor-pointer"}`}
                    >
                        👎 {dislikes}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default PostCard;
