<h1>MERN Stack Real-Time Chat Application</h1>
<p>A feature-rich, full-stack chat application built with the MERN stack (MongoDB, Express.js, React, Node.js) and Socket.IO for real-time communication. This project demonstrates a complete client-server architecture with user authentication, live messaging, and a modern, responsive user interface.</p>
<p><strong>Live Demo:</strong> <a href="https://your-frontend-url.vercel.app/"><strong>https://your-frontend-url.vercel.app/</strong></a></p>
        
<hr>
<h2>Screenshot & Demo</h2>
        <p><em><img src="https://github.com/preesha73/Real-Time-ChatApp/blob/main/a.png" alt="Screenshot of the MERN Chat Application" class="screenshot"><br><br><img src="https://github.com/preesha73/Real-Time-ChatApp/blob/main/b.png" alt="Screenshot of the MERN Chat Application" class="screenshot"><br><br><img src="https://github.com/preesha73/Real-Time-ChatApp/blob/main/c.png" alt="Screenshot of the MERN Chat Application" class="screenshot"><br></em></p>

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
