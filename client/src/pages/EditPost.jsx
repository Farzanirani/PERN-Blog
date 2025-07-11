import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import { toast } from 'react-toastify';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import '../quillContent.css'; // ✅ We'll write CSS here


function EditPost() {
  const { id } = useParams();
  const { token } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ title: '', content: '' });
  const [loading, setLoading] = useState(true);

  // Load post data on mount
  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/posts/${id}`);
        setForm({ title: res.data.title, content: res.data.content }); // HTML content
        setLoading(false);
      } catch (error) {
        console.error('Error fetching post:', error);
        toast.error('Failed to load post');
        navigate('/');
      }
    };
    fetchPost();
  }, [id, navigate]);

  function handleTitleChange(e) {
    setForm({ ...form, title: e.target.value });
  }

  function handleContentChange(value) {
    setForm({ ...form, content: value }); // value is HTML
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      await axios.put(
        `http://localhost:5000/api/posts/${id}`,
        form,
        {
          headers: {
            token,
          },
        }
      );
      toast.success('Post updated successfully!');
      navigate('/');
    } catch (error) {
      console.error('Error updating post:', error);
      toast.error('Failed to update post');
    }
  }

const modules = {
  toolbar: [
    [{ header: [1, 2, 3, 4, 5, false] }],    // Heading levels
    ['bold', 'italic', 'underline', 'strike'], // Text styles
    [{ color: [] }, { background: [] }],    // Text & background colors
    [{ font: [] }],                         // Font selection
    [{ size: ['small', false, 'large', 'huge'] }], // Font sizes

    [{ align: [] }],                        // Text alignment
    [{ list: 'ordered' }, { list: 'bullet' }], // Lists
    [{ indent: '-1' }, { indent: '+1' }],   // Indentation
    [{ direction: 'rtl' }],                 // Text direction (e.g., Arabic, Hebrew)

    ['blockquote', 'code-block'],           // Blockquote & code formatting
    ['link', 'image', 'video'],             // Media
    ['clean'],                              // Remove formatting
  ],
};



  if (loading) return <p className="text-center mt-10">Loading...</p>;

  return (
    <div className="max-w-xl mx-auto mt-10">
      <h2 className="text-2xl font-bold mb-4">Edit Post</h2>
      <form onSubmit={handleSubmit} className="space-y-4 mb-8">
        <input
          name="title"
          placeholder="Title"
          value={form.title}
          onChange={handleTitleChange}
          className="w-full p-2 border rounded"
          required
        />

        <ReactQuill
          value={form.content}
          onChange={handleContentChange}
          modules={modules}
          placeholder="Update blog content..."
          className="bg-white rounded"
        />

        <button
          type="submit"
          className="bg-green-600 text-white px-4 py-2 rounded hover:cursor-pointer"
        >
          Save Changes
        </button>
      </form>
    </div>
  );
}

export default EditPost;
