import './App.css'
import Navbar from './components/Navbar'
import { Routes, Route } from 'react-router-dom'
import AllPosts from './pages/AllPosts'
import CreatePost from './pages/CreatePost'
import EditPost from './pages/EditPost'
import YourPosts from './pages/YourPosts'
import Login from './pages/Login'
import Signup from './pages/Signup'
import ManageUsers from './pages/ManageUsers'
import PostDetails from './pages/PostDetails'
import PrivateRoute from './components/PrivateRoute'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import GoogleSuccess from './pages/GoogleSuccess'


function App() {

  return (
    <>
      <Navbar />
      
      <ToastContainer position="top-center" autoClose={3000} />

      <Routes>


        <Route path='/' element={<AllPosts />} />

        <Route path='/create' element={
          <PrivateRoute roles={["user", "moderator", "admin"]}>
            <CreatePost />
          </PrivateRoute>
        } />

        <Route path='/edit/:id' element={
          <PrivateRoute roles={["user","moderator", "admin"]} >
            <EditPost />
          </PrivateRoute>
        } />

        <Route path='/your-posts' element={
          <PrivateRoute>
            <YourPosts />
          </PrivateRoute>
        } />
        
        <Route path='/login' element={<Login />} />
        <Route path='/signup' element={<Signup />} />
        <Route path='/post/:id' element={<PostDetails />} />

        <Route path='/manage-users' element={
          <PrivateRoute roles={["admin"]} >
            <ManageUsers />
          </PrivateRoute>
        } />

        <Route path='/google-success' element={<GoogleSuccess />} />

      </Routes>

    </>
  )
}

export default App
