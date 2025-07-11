// components/CommentBox.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/useAuth";
import { toast } from "react-toastify";
import { Trash2 } from "lucide-react";

function CommentBox({ postId }) {
    const { token, user } = useAuth();
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [replyingTo, setReplyingTo] = useState(null); // comment id
    const [replyText, setReplyText] = useState("");


    useEffect(() => {
        fetchComments();
    }, [postId]);

    async function fetchComments() {
        try {
            const res = await axios.get(`http://localhost:5000/api/comments/${postId}`);
            setComments(res.data);
        } catch (error) {
            console.error("Failed to fetch comments", error);
            toast.error("Could not load comments");
        } finally {
            setIsLoading(false);
        }
    }

    async function handleCommentSubmit(e) {
        e.preventDefault();
        if (!newComment.trim()) return;
        try {
            await axios.post(
                `http://localhost:5000/api/comments/${postId}`,
                { content: newComment },
                { headers: { token } }
            );
            setNewComment("");
            fetchComments();
        } catch (error) {
            console.error("Failed to add comment", error);
            toast.error("Could not add comment");
        }
    }

    async function handleDelete(commentId) {
        if (!window.confirm("Delete this comment?")) return;
        try {
            await axios.delete(`http://localhost:5000/api/comments/${commentId}`, {
                headers: { token },
            });
            fetchComments();
        } catch (error) {
            console.error("Failed to delete comment", error);
            toast.error("Could not delete comment");
        }
    }

    function renderComments(comments, parentId = null) {
        return comments
            .filter((c) => c.parent_id === parentId)
            .map((c) => (
                <div key={c.id} className="mb-3 ml-0 sm:ml-4">
                    <div className="flex justify-between items-start bg-gray-100 p-3 rounded">
                        <div>
                            <p className="text-sm font-semibold">{c.username}</p>
                            <p className="text-gray-800 whitespace-pre-wrap text-sm">{c.content}</p>
                        </div>
                        {(user?.id === c.user_id || user?.role === "admin" || user?.role === "moderator") && (
                            <button
                                className="text-red-500 hover:text-red-700 hover:cursor-pointer"
                                onClick={() => handleDelete(c.id)}
                            >
                                <Trash2 size={16} />
                            </button>
                        )}
                    </div>

                    {/* Replies */}
                    <div className="ml-4 mt-2">
                        {/* Reply Button */}
                        <button
                            className="text-blue-600 text-sm mt-1 hover:cursor-pointer"
                            onClick={() => setReplyingTo(c.id)}
                        >
                            Reply
                        </button>

                        {/* Show reply input if this is the one being replied to */}
                        {replyingTo === c.id && (
                            <form
                                onSubmit={(e) => handleReplySubmit(e, c.id)}
                                className="mt-2"
                            >
                                <textarea
                                    className="w-full border rounded p-2 text-sm"
                                    rows={2}
                                    value={replyText}
                                    onChange={(e) => setReplyText(e.target.value)}
                                    placeholder="Write a reply..."
                                />
                                <div className="flex justify-end gap-2 mt-1">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setReplyingTo(null);
                                            setReplyText("");
                                        }}
                                        className="text-sm text-gray-600 hover:cursor-pointer"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:cursor-pointer"
                                    >
                                        Reply
                                    </button>
                                </div>
                            </form>
                        )}

                        {renderComments(comments, c.id)}
                    </div>

                </div>
            ));
    }

    async function handleReplySubmit(e, parentId) {
        e.preventDefault();
        if (!replyText.trim()) return;

        try {
            await axios.post(
                `http://localhost:5000/api/comments/${postId}`,
                { content: replyText, parent_id: parentId },
                { headers: { token } }
            );
            setReplyingTo(null);
            setReplyText("");
            fetchComments();
        } catch (err) {
            console.error("Failed to reply", err);
            toast.error("Could not add reply");
        }
    }


    return (
        <div className="border rounded p-4 mt-10 max-h-96 overflow-y-auto">
            <h3 className="text-lg font-bold mb-2">Comments</h3>

            {isLoading ? (
                <p className="text-sm text-gray-500">Loading comments...</p>
            ) : comments.length === 0 ? (
                <p className="text-sm text-gray-500">No comments yet. Be the first!</p>
            ) : (
                renderComments(comments)
            )}

            <form
                onSubmit={handleCommentSubmit}
                className="mt-4 flex flex-col gap-2 border-t pt-4"
            >
                <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Write a comment..."
                    className="w-full p-2 border rounded"
                    rows={2}
                ></textarea>
                <button
                    type="submit"
                    className="self-end bg-blue-600 text-white px-4 py-1 rounded hover:cursor-pointer"
                >
                    Comment
                </button>
            </form>
        </div>
    );
}

export default CommentBox;
