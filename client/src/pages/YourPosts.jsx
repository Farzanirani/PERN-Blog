import axios from 'axios'
import React, { useEffect, useState } from 'react'
import PostCard from '../components/PostCard'
import { useAuth } from '../context/useAuth'


function YourPosts() {

  const { user } = useAuth()

  const [yourPosts, setYourPosts] = useState([])

  useEffect(() => {
    const fetchYourPosts = async () => {
      try {
        if (!user) return;
        const res = await axios.get(
          `http://localhost:5000/api/posts/user/${user.id}`,
          {
            headers: {
              token: localStorage.getItem("token"),
            },
          }
        );
        setYourPosts(res.data);
      } catch (error) {
        console.error("Failed to fetch your posts", error);
      }
    };

    fetchYourPosts();
  }, [user]);

  const handleDelete = (deletedPostId) => {
    setYourPosts((prev) => prev.filter((p) => p.id !== deletedPostId));
  };


  return (
    <>
      <div className="max-w-3xl mx-auto mt-8">
        <h1 className="text-2xl font-bold mb-4">Your Posts</h1>
        {yourPosts.map(post => <PostCard key={post.id} post={post} canEdit={true} canDelete={true} onDelete={handleDelete} />)}
      </div>
    </>
  )
}

export default YourPosts