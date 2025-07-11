import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/useAuth';
import { toast } from 'react-toastify';

const roles = ["user", "moderator", "admin"];

function ManageUsers() {
  const { token, user } = useAuth();
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    try {
      const res = await axios.get("http://localhost:5000/api/admin/users", {
        headers: { token },
      });
      setUsers(res.data);
    } catch (err) {
      toast.error("Failed to fetch users");
      console.error(err);
    }
  }

  async function handleRoleChange(id, newRole) {
    try {
      await axios.put(
        `http://localhost:5000/api/admin/users/${id}/role`,
        { role: newRole },
        { headers: { token } }
      );
      toast.success("Role updated successfully");
      setUsers(prev =>
        prev.map(user => user.id === id ? { ...user, role: newRole } : user)
      );
    } catch (err) {
      toast.error(err.response?.data || "Failed to update role");
      console.error(err);
    }
  }

  async function handleDelete(id) {
    const confirmed = window.confirm("Are you sure you want to delete this user?");
    if (!confirmed) return;

    try {
      await axios.delete(`http://localhost:5000/api/admin/users/${id}`, {
        headers: { token },
      });
      toast.success("User deleted");
      setUsers(prev => prev.filter(user => user.id !== id));
    } catch (err) {
      toast.error(err.response?.data || "Failed to delete user");
      console.error(err);
    }
  }

  const filteredUsers = users.filter(user =>
    user.username.toLowerCase().includes(search.toLowerCase()) || user.id.toString().includes(search) || user.email.toString().includes(search)
  );

  return (
    <div className="max-w-4xl mx-auto mt-8 p-4">
      <h2 className="text-2xl font-bold mb-4">Manage Users</h2>
      <input
        type="text"
        placeholder="Search by username or ID"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="p-2 border rounded w-full mb-4"
      />
      <table className="w-full border">
        <thead>
          <tr className="bg-gray-100 text-left">
            <th className="p-2">Username</th>
            <th className="p-2">Email</th>
            <th className="p-2">Role</th>
            <th className="p-2">Action</th>
          </tr>
        </thead>
        <tbody>
          {filteredUsers.map(u => (
            <tr key={u.id} className="border-t">
              <td className="p-2">{u.username}</td>
              <td className="p-2">{u.email}</td>
              <td className="p-2">
                <select
                  value={u.role}
                  disabled={u.id === user.id}
                  onChange={(e) => handleRoleChange(u.id, e.target.value)}
                  className="border p-1 rounded"
                >
                  {roles.map(r => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </td>
              <td className="p-2">
                {u.id !== user.id && (
                  <button
                    onClick={() => handleDelete(u.id)}
                    className="text-red-500 hover:underline hover:cursor-pointer"
                  >
                    Delete
                  </button>
                )}
                {u.id === user.id && <span className="text-gray-400">Self</span>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ManageUsers;
