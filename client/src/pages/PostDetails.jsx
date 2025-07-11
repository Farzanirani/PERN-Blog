// src/pages/PostDetails.jsx
import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/useAuth";
import { toast } from "react-toastify";
import CommentBox from "../components/CommentBox";
import '../quillContent.css';


function PostDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const [likes, setLikes] = useState(0);
  const [dislikes, setDislikes] = useState(0);
  const [userReaction, setUserReaction] = useState(null); // null, true (liked), false (disliked)

  const [post, setPost] = useState(null);

  const isOwner = user && post && user.id === post.user_id;

  useEffect(() => {
    async function fetchPost() {
      try {
        const res = await axios.get(`http://localhost:5000/api/posts/${id}`);
        setPost(res.data);
      } catch (error) {
        console.error("Error fetching post:", error);
        toast.error("Failed to load post");
      }
    }

    fetchPost();
  }, [id]);

  const canEdit = user && (user.role === "admin" || user.id === post?.user_id);
  const canDelete =
    user &&
    (user.role === "admin" ||
      user.role === "moderator" ||
      user.id === post?.user_id);

  async function handleDelete() {
    const confirm = window.confirm("Are you sure you want to delete this post?");
    if (!confirm) return;

    try {
      await axios.delete(`http://localhost:5000/api/posts/${post.id}`, {
        headers: {
          token,
        },
      });
      toast.success("Post deleted");
      navigate("/");
    } catch (err) {
      console.error("Failed to delete post", err);
      toast.error("Could not delete post");
    }
  }

  useEffect(() => {
    if (post?.id) fetchReactions();
  }, [post]);

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

  if (!post) return <div className="text-center mt-6">Loading...</div>;

  return (
    <div className="max-w-3xl mx-auto mt-8 mb-8">

      {post.header_image && (
        <img
          src={post.header_image}
          alt="Header"
          className="w-full max-h-[400px] object-cover rounded mb-6"
        />
      )}
      <h1 className="text-3xl font-bold mb-4">{post.title}</h1>
      <p className="text-gray-600 mb-2">By: {post.username}</p>

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


      {(canEdit || canDelete) && (
        <div className="flex gap-4 mt-4">
          {canEdit && (
            <Link
              to={`/edit/${post.id}`}
              className="bg-green-600 text-white px-4 py-2 rounded"
            >
              Edit
            </Link>
          )}
          {canDelete && (
            <button
              onClick={handleDelete}
              className="bg-red-600 text-white px-4 py-2 rounded hover:cursor-pointer"
            >
              Delete
            </button>
          )}
        </div>
      )}


      {/* <p className="text-gray-700 mb-6 whitespace-pre-wrap mt-8">{post.content}</p> */}
      <div
        className="quill-content max-w-none my-8"
        dangerouslySetInnerHTML={{ __html: post.content }}
      ></div>


      <CommentBox postId={id} />


    </div>
  );
}

export default PostDetails;
