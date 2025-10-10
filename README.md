# 💬 Real-Time Chat Application

A modern, full-featured chat application built with React and Node.js, featuring real-time messaging, group chats, file sharing, and user authentication.

![Chat Application](https://img.shields.io/badge/React-18+-blue?style=for-the-badge&logo=react)
![Node.js](https://img.shields.io/badge/Node.js-18+-green?style=for-the-badge&logo=node.js)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green?style=for-the-badge&logo=mongodb)
![Socket.io](https://img.shields.io/badge/Socket.io-4.8+-black?style=for-the-badge&logo=socket.io)

## ✨ Features

### 🔐 Authentication & Security
- **JWT-based authentication** with secure token management
- **Password hashing** using bcrypt
- **Protected routes** and middleware
- **Session management** with cookies

### 💬 Real-Time Messaging
- **Instant messaging** with Socket.io WebSocket connections
- **Group chat functionality** with multiple participants
- **Message history** persistence in MongoDB
- **Online/offline status** indicators
- **Typing indicators** for enhanced UX

### 📁 File Sharing
- **Document uploads** with Cloudinary integration
- **Image sharing** with preview capabilities
- **File type validation** and size limits
- **Secure file storage** and retrieval

### 🎨 Modern UI/UX
- **Responsive design** with Tailwind CSS
- **Animated components** using Framer Motion
- **Dark/light theme** support
- **Interactive chat interface** with smooth animations
- **Mobile-friendly** design

### 👥 User Management
- **User profiles** with customizable settings
- **Friend system** and user discovery
- **Group management** with admin controls
- **User search** and filtering

## 🛠️ Tech Stack

### Frontend
- **React 18** - Modern UI framework
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Animation library
- **Socket.io Client** - Real-time communication
- **Axios** - HTTP client
- **React Router** - Client-side routing

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **Socket.io** - Real-time bidirectional communication
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **JWT** - JSON Web Tokens for authentication
- **bcrypt** - Password hashing
- **Cloudinary** - Cloud-based image and video management
- **Multer** - File upload middleware

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 or higher)
- MongoDB Atlas account
- Cloudinary account (for file uploads)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/chat-application.git
   cd chat-application
   ```

2. **Backend Setup**
   ```bash
   cd chat-app/backend
   npm install
   ```

3. **Create environment file**
   ```bash
   # Create .env file in chat-app/backend/
   MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/chat-app
   JWT_SECRET=your-super-secret-jwt-key-here
   PORT=5000
   CLIENT_ORIGIN=http://localhost:5173
   CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
   CLOUDINARY_API_KEY=your-cloudinary-api-key
   CLOUDINARY_API_SECRET=your-cloudinary-api-secret
   ```

4. **Frontend Setup**
   ```bash
   cd ../frontend
   npm install
   ```

5. **Start the application**
   ```bash
   # Terminal 1 - Backend
   cd chat-app/backend
   npm run dev

   # Terminal 2 - Frontend
   cd chat-app/frontend
   npm run dev
   ```

6. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000

## 📱 Application Screenshots

### Login & Registration
- Clean, modern authentication interface
- Form validation and error handling
- Responsive design for all devices

### Chat Interface
- Real-time messaging with smooth animations
- Group chat management
- File sharing capabilities
- User status indicators

### Group Management
- Create and manage chat groups
- Add/remove participants
- Group settings and permissions

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Messages
- `GET /api/messages/:groupId` - Get messages for a group
- `POST /api/messages` - Send a new message
- `DELETE /api/messages/:id` - Delete a message

### Users
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user profile

### Groups
- `GET /api/groups` - Get user's groups
- `POST /api/groups` - Create a new group
- `PUT /api/groups/:id` - Update group
- `DELETE /api/groups/:id` - Delete group

### File Upload
- `POST /api/upload` - Upload files to Cloudinary

## 🌐 Deployment

This application is designed for easy deployment on modern cloud platforms:

- **Frontend**: Deploy to Vercel, Netlify, or similar
- **Backend**: Deploy to Railway, Render, or Heroku
- **Database**: MongoDB Atlas (cloud-hosted)
- **File Storage**: Cloudinary (cloud-hosted)

See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for detailed deployment instructions.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Your Name**
- GitHub: [@PavanKarthik777-ghub](https://github.com/PavanKarthik777-ghub)
- LinkedIn: [Pavan Karthik Mutnuru](https://www.linkedin.com/in/pavan-karthik-mutnuru-9b80b327b/)
- Email: karthikpavan747@gmail.com

## 🙏 Acknowledgments

- Socket.io for real-time communication
- MongoDB for flexible data storage
- Cloudinary for file management
- Tailwind CSS for beautiful styling
- React community for excellent libraries

---

⭐ **Star this repository if you found it helpful!**
