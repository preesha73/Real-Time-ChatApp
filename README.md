<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>MERN Stack Real-Time Chat Application - README</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans", Helvetica, Arial, sans-serif;
            line-height: 1.6;
            background-color: #0d1117;
            color: #c9d1d9;
            margin: 0;
            padding: 2rem;
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
            background-color: #161b22;
            border: 1px solid #30363d;
            border-radius: 8px;
            padding: 2rem;
        }
        h1, h2, h3 {
            color: #ffffff;
            border-bottom: 1px solid #30363d;
            padding-bottom: 0.5rem;
            margin-top: 2rem;
            margin-bottom: 1rem;
        }
        h1 { font-size: 2em; }
        h2 { font-size: 1.75em; }
        h3 { font-size: 1.5em; }
        p {
            margin-bottom: 1rem;
        }
        a {
            color: #58a6ff;
            text-decoration: none;
        }
        a:hover {
            text-decoration: underline;
        }
        ul {
            list-style-type: disc;
            padding-left: 2rem;
        }
        li {
            margin-bottom: 0.5rem;
        }
        pre {
            background-color: #0d1117;
            padding: 1rem;
            border-radius: 6px;
            border: 1px solid #30363d;
            overflow-x: auto;
        }
        code {
            font-family: "SF Mono", "Consolas", "Liberation Mono", Menlo, Courier, monospace;
            font-size: 0.9em;
        }
        strong {
            color: #ffffff;
        }
        hr {
            border: 0;
            height: 1px;
            background-color: #30363d;
            margin: 2rem 0;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>MERN Stack Real-Time Chat Application</h1>
        <p>A feature-rich, full-stack chat application built with the MERN stack (MongoDB, Express.js, React, Node.js) and Socket.IO for real-time communication. This project demonstrates a complete client-server architecture with user authentication, live messaging, and a modern, responsive user interface.</p>
        <p><strong>Live Demo:</strong> <a href="https://your-frontend-url.vercel.app/"><strong>https://your-frontend-url.vercel.app/</strong></a></p>
        
        <hr>

        <h3>Screenshot & Demo</h3>
        <p><em>(Here you can also add a short GIF showing the app in action. You can use a tool like Giphy Capture or ScreenToGif to record one.)</em></p>

        <h2>Features</h2>
        <ul>
            <li><strong>User Authentication:</strong> Secure user registration and login using JWT (JSON Web Tokens) and password hashing with bcrypt.</li>
            <li><strong>Real-Time Messaging:</strong> Instant message delivery and reception using WebSockets (Socket.IO).</li>
            <li><strong>Live Online User List:</strong> See who is currently connected to the application in real-time.</li>
            <li><strong>"User is Typing" Indicator:</strong> Provides a better conversational experience by showing when another user is typing.</li>
            <li><strong>Message History:</strong> All messages are persisted in the MongoDB database and loaded upon login.</li>
            <li><strong>Responsive UI:</strong> A clean and modern user interface built with React and styled with Tailwind CSS, ensuring a great experience on both desktop and mobile devices.</li>
            <li><strong>RESTful API:</strong> A well-structured backend API built with Express.js and Mongoose.</li>
        </ul>

        <h2>Tech Stack</h2>
        <h3>Frontend</h3>
        <ul>
            <li>React.js</li>
            <li>Socket.IO Client</li>
            <li>Tailwind CSS</li>
            <li>Axios</li>
            <li>Vite (Build Tool)</li>
        </ul>
        <h3>Backend</h3>
        <ul>
            <li>Node.js</li>
            <li>Express.js</li>
            <li>MongoDB (with Mongoose)</li>
            <li>Socket.IO</li>
            <li>JSON Web Tokens (JWT)</li>
            <li>Bcrypt.js</li>
        </ul>
        <h3>Deployment</h3>
        <ul>
            <li>Frontend: Vercel</li>
            <li>Backend: Render</li>
            <li>Database: MongoDB Atlas</li>
        </ul>

        <hr>

        <h2>How to Run Locally</h2>
        <p>To get a local copy up and running, follow these simple steps.</p>

        <h3>Prerequisites</h3>
        <ul>
            <li>Node.js installed</li>
            <li>npm (Node Package Manager)</li>
            <li>A MongoDB Atlas account and connection string</li>
        </ul>

        <h3>Installation</h3>
        <ol>
            <li>
                <p><strong>Clone the repo</strong></p>
                <pre><code>git clone https://github.com/your-username/your-repo-name.git</code></pre>
            </li>
            <li>
                <p><strong>Install Backend Dependencies</strong></p>
                <pre><code>cd server
npm install</code></pre>
            </li>
            <li>
                <p><strong>Install Frontend Dependencies</strong></p>
                <pre><code>cd ../client
npm install</code></pre>
            </li>
            <li>
                <p><strong>Set Up Environment Variables</strong></p>
                <p>In the <code>/server</code> directory, create a <code>.env</code> file and add the following:</p>
                <pre><code>MONGO_URI=YOUR_MONGO_CONNECTION_STRING
JWT_SECRET=YOUR_SUPER_SECRET_KEY</code></pre>
            </li>
            <li>
                <p><strong>Run the Application</strong></p>
                <p>To run the backend server, navigate to the <code>/server</code> directory and run:</p>
                <pre><code>npm start</code></pre>
                <p>To run the frontend client, navigate to the <code>/client</code> directory and run:</p>
                <pre><code>npm run dev</code></pre>
            </li>
        </ol>
    </div>
</body>
</html>
