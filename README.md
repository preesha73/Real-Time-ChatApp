MERN Stack Real-Time Chat Application
A feature-rich, full-stack chat application built with the MERN stack (MongoDB, Express.js, React, Node.js) and Socket.IO for real-time communication. This project demonstrates a complete client-server architecture with user authentication, live messaging, and a modern, responsive user interface.

Live Demo: https://your-frontend-url.vercel.app/

Screenshot & Demo
(Here you can also add a short GIF showing the app in action. You can use a tool like Giphy Capture or ScreenToGif to record one.)

Features
User Authentication: Secure user registration and login using JWT (JSON Web Tokens) and password hashing with bcrypt.

Real-Time Messaging: Instant message delivery and reception using WebSockets (Socket.IO).

Live Online User List: See who is currently connected to the application in real-time.

"User is Typing" Indicator: Provides a better conversational experience by showing when another user is typing.

Message History: All messages are persisted in the MongoDB database and loaded upon login.

Responsive UI: A clean and modern user interface built with React and styled with Tailwind CSS, ensuring a great experience on both desktop and mobile devices.

RESTful API: A well-structured backend API built with Express.js and Mongoose.

Tech Stack
Frontend
React.js

Socket.IO Client

Tailwind CSS

Axios

Vite (Build Tool)

Backend
Node.js

Express.js

MongoDB (with Mongoose)

Socket.IO

JSON Web Tokens (JWT)

Bcrypt.js

Deployment
Frontend: Vercel

Backend: Render

Database: MongoDB Atlas

How to Run Locally
To get a local copy up and running, follow these simple steps.

Prerequisites
Node.js installed

npm (Node Package Manager)

A MongoDB Atlas account and connection string

Installation
Clone the repo

git clone [https://github.com/your-username/your-repo-name.git](https://github.com/your-username/your-repo-name.git)

Install Backend Dependencies

cd server
npm install

Install Frontend Dependencies

cd ../client
npm install

Set Up Environment Variables

In the /server directory, create a .env file and add the following:

MONGO_URI=YOUR_MONGO_CONNECTION_STRING
JWT_SECRET=YOUR_SUPER_SECRET_KEY

Run the Application

To run the backend server, navigate to the /server directory and run:

npm start

To run the frontend client, navigate to the /client directory and run:

npm run dev
