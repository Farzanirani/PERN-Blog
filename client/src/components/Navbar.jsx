import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-blue-600 text-white pt-4 pb-4 flex justify-around items-center w-full">
      <div className="flex items-center justify-center text-lg font-bold h-full w-1/4">
        <Link to="/" >MyBlog</Link>
      </div>

      <div className="flex gap-8 items-center justify-center h-full w-2/4">
        <Link to="/" className=" font-semibold hover:text-black">All Posts</Link>

        {user && (
          <>
            <Link to="/your-posts" className="font-semibold hover:text-black">Your Posts</Link>
            <Link to="/create" className="font-semibold hover:text-black">Create</Link>
          </>
        )}

        {user?.role === "admin" && (
          <Link to="/manage-users" className="font-semibold hover:text-black">Manage Users</Link>
        )}

      </div>

      <div className="flex gap-4 items-center justify-center h-full w-1/4" >
        {user ? (
          <>
            <span className="text-sm">Hello, {user.username}</span>
            <button onClick={handleLogout} className="bg-red-600 font-semibold text-white px-4 py-2 rounded hover:cursor-pointer hover:shadow-lg/30">Logout</button>
          </>
        ) : (
          <>
            <button className="bg-white text-blue-600 px-4 py-2 rounded hover:cursor-pointer hover:text-black hover:shadow-lg/30"><Link to="/login" className="font-semibold" >Login</Link></button>
            <button className="bg-white text-blue-600 px-4 py-2 rounded hover:cursor-pointer hover:text-black hover:shadow-lg/30"><Link to="/signup" className="font-semibold" >Signup</Link></button>

          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
