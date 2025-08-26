# 🎥 Video Streaming App - Backend

This is the **backend service** for the Video Streaming App, built with **Node.js**, **Express**, and **MongoDB**.  
It provides REST APIs for user authentication, video upload, streaming, likes, comments, and subscriptions.

---

## ✨ Features

### 🔐 Authentication & Authorization
- User registration & login with JWT tokens (access + refresh)  
- Password hashing with bcrypt  

### 📹 Video Management
- Upload videos (stored locally / cloud storage)  
- Stream videos using HTTP range requests  
- Update/Delete videos  

### ❤️ Engagement
- Like / Unlike videos  
- Comment on videos  
- Subscribe / Unsubscribe to channels  

### 👤 User Features
- Edit profile (username, avatar, bio)  
- View channel details  
- Manage subscriptions  

### 📊 Dashboard
- Track uploaded videos  
- Views & engagement count  

---

## 🛠️ Tech Stack

- **Backend Framework**: Node.js + Express  
- **Database**: MongoDB (Mongoose ODM)  
- **Authentication**: JWT (Access + Refresh tokens)  
- **File Upload**: Multer , Cloudinary (for handling video uploads)  
- **Streaming**: HTTP range requests  
- **Other Tools**: bcrypt, cookie-parser, dotenv, cors  

---


