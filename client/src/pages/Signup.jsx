import axios from 'axios';
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { z } from "zod";


function Signup() {

  const schema = z.object({
    username: z.string().min(3, "Username must be at least 3 characters"),
    email: z.string().email("Invalid email"),
    password: z
      .string()
      .min(7, "Password must be at least 7 characters")
      .regex(/[a-zA-Z]/, "Password must contain letters")
      .regex(/[0-9]/, "Password must contain numbers"),
  });

  const [form, setForm] = useState({ username: "", email: "", password: "" })
  const [error, setError] = useState("");
  const navigate = useNavigate()

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function handleSubmit(e) {
    try {
      e.preventDefault();
      setError("");

      schema.parse(form); // validates using Zod

      await axios.post("http://localhost:5000/api/auth/signup", form)
      navigate("/login");

    } catch (err) {
      if (err instanceof z.ZodError) {
        setError(err.errors[0].message); // Zod error
      } else if (err.response) {
        setError(err.response.data); // Server error
      } else {
        setError("Something went wrong");
      }
    }
  }




  return (
    <>
      <div className="max-w-md mx-auto mt-10 p-6 border rounded shadow">
        <h2 className="text-2xl font-semibold mb-4">Sign Up</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            name="username"
            placeholder="Username"
            className="w-full p-2 border rounded"
            value={form.username}
            onChange={handleChange}
            required
          />
          <input
            name="email"
            type="email"
            placeholder="Email"
            className="w-full p-2 border rounded"
            value={form.email}
            onChange={handleChange}
            required
          />
          <input
            name="password"
            type="password"
            placeholder="Password"
            className="w-full p-2 border rounded"
            value={form.password}
            onChange={handleChange}
            required
          />
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded w-full hover:cursor-pointer">
            Sign Up
          </button>
        </form>
        <a href="http://localhost:5000/api/auth/google">
          <button className="bg-red-600 text-white px-4 py-2 mt-4 rounded w-full hover:cursor-pointer">
            Sign In with Google
          </button>
        </a>
      </div>
    </>
  )
}

export default Signup