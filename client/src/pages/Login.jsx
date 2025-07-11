import React, { useState } from 'react'
import { useAuth } from '../context/useAuth'
import axios from 'axios'
import { z } from "zod";


function Login() {

  const schema = z.object({
    email: z.string().email("Invalid email"),
    password: z.string().min(1, "Password is required"),
  });

  const { login } = useAuth()
  const [form, setForm] = useState({ email: "", password: "" })
  const [error, setError] = useState("");

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function handleSubmit(e) {
    try {
      e.preventDefault();
      setError("");

      schema.parse(form); // validates using Zod

      const res = await axios.post("http://localhost:5000/api/auth/login", form)
      console.log("Token received:", res.data.token);
      login(res.data.token)
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
        <h2 className="text-2xl font-semibold mb-4">Login</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
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
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded w-full hover:cursor-pointer">
            Login
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

export default Login