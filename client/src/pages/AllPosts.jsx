import axios from 'axios'
import React, { useEffect, useState } from 'react'
import PostCard from '../components/PostCard'
import { useAuth } from '../context/useAuth'
import Fuse from 'fuse.js'

function AllPosts() {

  const { user } = useAuth()
  const canEdit = user && user.role === "admin";
  const canDelete = user && (user.role === "admin" || user.role === "moderator");

  const [allPosts, setAllPosts] = useState([])
  // const [search, setSearch] = useState('');
  // const [daysFilter, setDaysFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredPosts, setFilteredPosts] = useState([]);

  useEffect(() => async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/posts")
      setAllPosts(res.data)
      setFilteredPosts(res.data); // default

    } catch (error) {
      console.error(error.message)
    }
  }, [])

  function handleDelete(deletedPostId) {
    setAllPosts((prev) => prev.filter((p) => p.id !== deletedPostId));
  };

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredPosts(allPosts)
      return
    }

    const fuse = new Fuse(allPosts, {
      keys: ['title', 'content', 'username'],
      includeScore: true,
      threshold: 0.4,         // 🔁 Increase this to catch more fuzzy matches
      distance: 100,          // 🔁 Allow more distance between characters
      ignoreLocation: true,   // 🔁 Don't require match to start early in the string
      minMatchCharLength: 1,  // 🔁 Only match on terms with at least 2 chars
    })

    const results = fuse.search(searchQuery)
    setFilteredPosts(results.map(result => result.item))
  }, [searchQuery, allPosts])

  // const filteredPosts = allPosts.filter(post => {
  //   const postDate = new Date(post.created_at)
  //   const now = new Date()
  //   const daysOld = (postDate - now) * (1000 * 60 * 60 * 24)

  //   const matchSearch = search.toLowerCase().split(" ").some(word => post.title.toLowerCase().includes(word) || post.content.toLowerCase().includes(word));

  //   const matchDays = daysFilter === "all" || daysOld <= Number(daysFilter)

  //   return matchSearch && matchDays;

  // })

  return (
    <>
      <div className="max-w-3xl mx-auto mt-8">
        <h1 className="text-2xl font-bold text-center mb-4">All Posts</h1>

        <input
          type="text"
          placeholder="Search posts..."
          className="w-full mb-4 p-2 border rounded"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        {filteredPosts.map(post => <PostCard key={post.id} post={post} canEdit={canEdit} canDelete={canDelete} onDelete={handleDelete} />)}
        {filteredPosts.length === 0 && (
          <p className="text-center text-gray-500 mt-4">No posts found.</p>
        )}

      </div>
    </>
  )
}

export default AllPosts