import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/useAuth';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import '../quillContent.css';

function CreatePost() {
  const { token } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ title: '', content: '' });
  const [imageFile, setImageFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  // ✅ load from env
  const cloudName = import.meta.env.VITE_CLOUDINARY_NAME;
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

  function handleTitleChange(e) {
    setForm({ ...form, title: e.target.value });
  }

  function handleContentChange(value) {
    setForm({ ...form, content: value });
  }

  function handleImageChange(e) {
    setImageFile(e.target.files[0]);
  }

  async function uploadImageToCloudinary() {
    const data = new FormData();
    data.append("file", imageFile);
    data.append("upload_preset", uploadPreset);
    data.append("cloud_name", cloudName);

    try {
      setUploading(true);
      console.log("Uploading with:", cloudName, uploadPreset);

      const res = await axios.post(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        data
      );
      return res.data.secure_url;

    } catch (error) {

      console.error(error.message);
      console.error("Cloudinary Upload Error:", error.response?.data || error.message);
      toast.error("Header image upload failed");
      return null;

    } finally {

      setUploading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    let imageUrl = "";

    try {
      if (imageFile) {
        imageUrl = await uploadImageToCloudinary();
        if (!imageUrl) return;
      }

      await axios.post('http://localhost:5000/api/posts', {
        ...form,
        header_image: imageUrl,
      }, {
        headers: { token },
      });

      toast.success('Post created successfully!');
      navigate('/');
    } catch (err) {
      console.error(err);
      setError('Failed to create post');
      toast.error('Could not create post');
    }
  }

  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, 4, 5, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ color: [] }, { background: [] }],
      [{ font: [] }],
      [{ size: ['small', false, 'large', 'huge'] }],
      [{ align: [] }],
      [{ list: 'ordered' }, { list: 'bullet' }],
      [{ indent: '-1' }, { indent: '+1' }],
      [{ direction: 'rtl' }],
      ['blockquote', 'code-block'],
      ['link', 'image', 'video'],
      ['clean'],
    ],
  };

  return (
    <div className="max-w-xl mx-auto mt-10">
      <h2 className="text-2xl font-bold mb-4">Create Post</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
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
          placeholder="Write your blog content here..."
          className="bg-white rounded"
        />

        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="w-full border rounded"
        />

        {uploading && <p className="text-blue-500 text-sm">Uploading image...</p>}
        {error && <p className="text-red-500">{error}</p>}

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded"
          disabled={uploading}
        >
          {uploading ? "Creating..." : "Create"}
        </button>
      </form>
    </div>
  );
}

export default CreatePost;
