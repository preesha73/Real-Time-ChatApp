MERN Stack Real-Time Chat Application
This is a full-stack, real-time chat application built with the MERN stack (MongoDB, Express, React, Node.js) and Socket.IO. It's designed as a portfolio project to showcase skills in building scalable, modern web applications.

Features
User Authentication: Secure user registration and login using JWT (JSON Web Tokens).

Real-Time Messaging: Instant message delivery using Socket.IO.

Chat Rooms: Users can create and join different chat rooms.

Online User List: See who is currently online in real-time.

Typing Indicators: See when another user is typing a message.

Message History: Chat history is saved to and retrieved from a MongoDB database.

Responsive Design: A clean, modern UI built with React and Tailwind CSS that works on all devices.

Project Structure
The project is divided into two main folders:

/server: The Node.js/Express backend, responsible for the API and WebSocket connections.

/client: The React frontend, which provides the user interface.

/chat-app
|-- /client
|   |-- src
|   |   |-- App.jsx
|   |   `-- index.css
|   |-- index.html
|   |-- package.json
|   `-- vite.config.js
|-- /server
|   |-- models
|   |   |-- messageModel.js
|   |   `-- userModel.js
|   |-- index.js
|   `-- package.json
|-- .gitignore
`-- README.md

Setup & Installation
Follow these steps to get the project running on your local machine.

Prerequisites
Node.js and npm installed

MongoDB (You can use a free cloud instance from MongoDB Atlas)

1. Backend Setup
# 1. Navigate to the server directory
cd server

# 2. Install dependencies
npm install

# 3. Create a .env file in the /server directory
#    Add the following environment variables:
#    (Replace with your own values)
#
#    PORT=5000
#    MONGO_URI=your_mongodb_connection_string
#    JWT_SECRET=your_super_secret_jwt_key
#
# 4. Start the backend server
npm start

2. Frontend Setup
# 1. Open a new terminal and navigate to the client directory
cd client

# 2. Install dependencies
npm install

# 3. The React app will automatically look for the server on port 5000.
#    Start the frontend development server:
npm run dev

Your application should now be running!

The React frontend will be on http://localhost:5173 (or another port if 5173 is busy).

The Node.js backend will be running on http://localhost:5000.