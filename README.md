# PERN Blog Platform 📝

A full-featured blog platform built using the **PERN stack** (PostgreSQL, Express, React, Node.js) with a clean, modern interface and powerful features like authentication, rich content editing, role-based permissions, and media upload support.

---

## 🚀 Features

* 🔐 JWT-based Authentication (Login, Register)
* 🔍 Fuzzy Search across post titles, content, and author names
* ✍️ Rich text content editing with **React Quill**
* 📸 Cloudinary integration for image uploads (header image + inline content)
* ❤️ Like/Dislike functionality (excluding post owners)
* 💬 Comments and threaded replies per post
* 🤜 Role-based Access Control: user, admin, moderator
* 📅 Timestamps on all content (posts and comments)
* 📊 PostgreSQL as the relational database
* 💻 Responsive UI for mobile and desktop

---

## ⚙️ Tech Stack

* **Frontend**: React, Tailwind CSS, React Router, Axios, React Quill
* **Backend**: Express.js, Node.js, PostgreSQL, JWT
* **Database**: PostgreSQL (via `pg` driver)
* **Media**: Cloudinary for image hosting
* **Authentication**: JWT + Middleware

---

## 🛡️ Roles and Permissions

| Role          | Permissions                                                            |
| ------------- | ---------------------------------------------------------------------- |
| **User**      | Create posts, comment, reply, like/dislike other users’ posts          |
| **Admin**     | Full control: create/edit/delete any post or comment, manage all users |
| **Moderator** | Delete any comment or post, manage abuse without full admin control    |

> Post owners can **edit** or **delete** only their own posts. Users **cannot** like/dislike their own posts.

---

## 💼 Project Structure

```
pern-blog/
├── client/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── .env
├── server/
│   ├── routes/
│   ├── middleware/
│   ├── utils/
│   ├── db.js
│   ├── index.js
│   └── .env
└── README.md
```

---

## 🔧 Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/Farzanirani/PERN-Blog.git
cd pern-blog
```

### 2. Install Dependencies

```bash
# Backend
cd server
npm install

# Frontend
cd ../client
npm install
```

### 3. Set Up Environment Variables

#### ✉️ `/client/.env`

```
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
VITE_CLOUDINARY_UPLOAD_PRESET=your_upload_preset
```

#### ✉️ `/server/.env`

```
DATABASE_URL=postgresql://username:password@host:port/database
JWT_SECRET=your_jwt_secret
```

### 4. Set Up the Database

In your PostgreSQL database, run:

```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role VARCHAR(20) DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE posts (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  content TEXT NOT NULL,
  header_image TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE post_likes (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  post_id INTEGER REFERENCES posts(id) ON DELETE CASCADE,
  liked BOOLEAN NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, post_id)
);

CREATE TABLE comments (
  id SERIAL PRIMARY KEY,
  post_id INTEGER REFERENCES posts(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  parent_id INTEGER REFERENCES comments(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 5. Start the App

```bash
# Start backend
cd server
nodemon index.js

# Start frontend
cd ../client
npm run dev
```

---

## 📷 Screenshots

*Add screenshots of your UI: homepage, create post, post details, comments, etc.*

---

## 📄 License

This project is licensed under the [MIT License](./LICENSE).

---

## 🙋‍♂️ Author

**Farzan Irani**
[GitHub](https://github.com/farzanirani)

---

## ✨ Contributions

All contributions are welcome! Feel free to fork, open issues, or submit pull requests.

---

> Made with ❤️ using the PERN stack.
