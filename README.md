⚙️ TaskSync - Backend (Node.js & Express)
TaskSync is a robust server-side application built to manage data flow, secure user authentication, and enable real-time communication for a seamless task management experience.

✨ Key Features
User Authentication: Secure Signup/Login using JWT for session management and Bcrypt for password hashing.

RESTful API: Clean and structured endpoints for all Task CRUD operations.

Real-time Communication: Integrated Socket.io for instant task sharing and notifications.

Security: Configured CORS and environment variables to protect sensitive data.

Database Management: MongoDB Atlas with Mongoose for efficient cloud data storage.

🛠️ Tech Stack
Runtime: Node.js

Framework: Express.js

Database: MongoDB Atlas (NoSQL)

Real-time Engine: Socket.io

Authentication: JWT & Bcrypt

🚀 API Endpoints
POST /api/auth/register - Register a new user

POST /api/auth/login - User login & JWT generation

GET /api/tasks - Get all user tasks

POST /api/tasks - Create a new task with links

POST /api/tasks/share - Share task with others via email

🚀 Getting Started
Clone the repository: git clone https://github.com/M-Ahmad561Zaheer/tasksync-backend.git

Install dependencies: npm install

Configure Environment Variables: Create a .env file and add: MONGO_URI=your_mongodb_uri PORT=5000 JWT_SECRET=your_secret_key

Start the server: npm start

🔗 Frontend Repository
Client-side: https://github.com/M-Ahmad561Zaheer/tasksync-frontend

Developed by AZ-Developers
