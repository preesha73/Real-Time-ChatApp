import React, { useState, useEffect, useRef, createContext, useContext } from 'react';
import axios from 'axios';
import io from 'socket.io-client';

// --- Configuration ---
const SERVER_URL = 'http://localhost:5000';
const socket = io(SERVER_URL);

// --- Authentication Context ---
const AuthContext = createContext();

const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(JSON.parse(localStorage.getItem('chat_user')));

    const login = (userData) => {
        localStorage.setItem('chat_user', JSON.stringify(userData));
        setUser(userData);
    };

    const logout = () => {
        localStorage.removeItem('chat_user');
        setUser(null);
        // Note: Disconnect logic should be handled where the socket connection is managed.
    };

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

const useAuth = () => useContext(AuthContext);

// --- Main App Component ---
export default function App() {
    return (
        <AuthProvider>
            <Main />
        </AuthProvider>
    );
}

function Main() {
    const { user } = useAuth();
    return (
        <div className="font-sans antialiased bg-gray-900 text-gray-200 h-screen w-screen">
            {user ? <ChatPage /> : <AuthPage />}
        </div>
    );
}


// --- Authentication Page Component ---
function AuthPage() {
    const [isLogin, setIsLogin] = useState(true);
    const { login } = useAuth();

    const handleSubmit = async (e, username, password) => {
        e.preventDefault();
        const endpoint = isLogin ? '/api/login' : '/api/register';
        try {
            const res = await axios.post(`${SERVER_URL}${endpoint}`, { username, password });
            if (isLogin) {
                login({ username: res.data.username, userId: res.data.userId });
            } else {
                alert('Registration successful! Please log in.');
                setIsLogin(true);
            }
        } catch (error) {
            console.error("Auth error", error.response?.data?.msg || "An error occurred");
            alert(error.response?.data?.msg || "An error occurred");
        }
    };

    return (
        <div className="flex items-center justify-center h-full">
            <div className="bg-gray-800 p-8 rounded-lg shadow-2xl w-full max-w-sm">
                <h1 className="text-3xl font-bold mb-6 text-center text-white">
                    {isLogin ? 'Welcome Back' : 'Create Account'}
                </h1>
                <AuthForm isLogin={isLogin} onSubmit={handleSubmit} />
                <button
                    onClick={() => setIsLogin(!isLogin)}
                    className="w-full text-center mt-4 text-blue-400 hover:underline"
                >
                    {isLogin ? 'Need an account? Register' : 'Have an account? Login'}
                </button>
            </div>
        </div>
    );
}

function AuthForm({ isLogin, onSubmit }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    return (
        <form onSubmit={(e) => onSubmit(e, username, password)} className="space-y-4">
            <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username"
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
            />
            <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
            />
            <button type="submit" className="w-full bg-blue-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-blue-700 transition duration-300">
                {isLogin ? 'Login' : 'Register'}
            </button>
        </form>
    );
}


// --- Chat Page Component ---
function ChatPage() {
    const [rooms] = useState(['general', 'tech', 'random']); // Static rooms for this example
    const [currentRoom, setCurrentRoom] = useState('general');
    const [onlineUsers, setOnlineUsers] = useState([]);
    
    const { user } = useAuth();
    
    useEffect(() => {
        if(user) {
            // Announce user is online
            socket.emit('go-online', { userId: user.userId, username: user.username });

            // Listen for the updated list of online users
            socket.on('online-users', (users) => {
                setOnlineUsers(users);
            });
            
            // Cleanup on component unmount
            return () => {
                socket.off('online-users');
            };
        }
    }, [user]);

    return (
        <div className="grid grid-cols-12 h-screen w-screen">
            <Sidebar rooms={rooms} setCurrentRoom={setCurrentRoom} currentRoom={currentRoom} />
            <ChatArea room={currentRoom} />
            <OnlineUsersPanel onlineUsers={onlineUsers} />
        </div>
    );
}

// --- Sidebar Component ---
function Sidebar({ rooms, setCurrentRoom, currentRoom }) {
    const { user, logout } = useAuth();
    return (
        <aside className="col-span-3 lg:col-span-2 bg-gray-800 flex flex-col justify-between">
            <div>
                <div className="p-4 border-b border-gray-700">
                    <h2 className="text-xl font-bold text-white">Chat Rooms</h2>
                </div>
                <div className="p-2">
                    {rooms.map(room => (
                        <div
                            key={room}
                            onClick={() => setCurrentRoom(room)}
                            className={`p-2 my-1 rounded-md cursor-pointer transition capitalize ${currentRoom === room ? 'bg-blue-600 font-semibold' : 'hover:bg-gray-700'}`}
                        >
                            # {room}
                        </div>
                    ))}
                </div>
            </div>
            <div className="p-4 border-t border-gray-700 flex items-center space-x-3">
                 <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center font-bold text-white text-xl">
                    {user.username.charAt(0).toUpperCase()}
                 </div>
                 <div>
                    <p className="font-semibold text-white">{user.username}</p>
                    <button onClick={logout} className="text-xs text-red-400 hover:underline">Logout</button>
                 </div>
            </div>
        </aside>
    );
}

// --- Chat Area Component ---
function ChatArea({ room }) {
    const [messages, setMessages] = useState([]);
    const [typingStatus, setTypingStatus] = useState('');
    const { user } = useAuth();
    const chatEndRef = useRef(null);

    useEffect(() => {
        // Fetch message history when room changes
        axios.get(`${SERVER_URL}/api/messages/${room}`)
            .then(res => setMessages(res.data))
            .catch(err => console.error("Failed to fetch messages", err));

        // Join socket room
        socket.emit('join-room', room);

        // Listen for new messages
        const messageListener = (newMessage) => {
            setMessages((prevMessages) => [...prevMessages, newMessage]);
        };
        socket.on('receive-message', messageListener);
        
        // Listen for typing status
        const typingListener = (status) => setTypingStatus(status);
        socket.on('typing', typingListener);
        const stopTypingListener = () => setTypingStatus('');
        socket.on('stop-typing', stopTypingListener);

        // Cleanup: remove listeners when component unmounts or room changes
        return () => {
            socket.off('receive-message', messageListener);
            socket.off('typing', typingListener);
            socket.off('stop-typing', stopTypingListener);
        };
    }, [room]);
    
    // Auto-scroll to the latest message
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);
    
    const handleSendMessage = (text) => {
        if (text.trim()) {
            socket.emit('send-message', { room, sender: user.userId, username: user.username, text });
            socket.emit('stop-typing', room);
        }
    };
    
    return (
        <main className="col-span-6 lg:col-span-7 bg-gray-900 flex flex-col h-screen">
            <header className="p-4 border-b border-gray-700">
                <h2 className="text-xl font-bold text-white capitalize"># {room}</h2>
            </header>
            <div className="flex-grow p-4 overflow-y-auto space-y-4">
                {messages.map((msg, index) => <MessageBubble key={index} msg={msg} />)}
                <div ref={chatEndRef} />
            </div>
            <div className="px-4 pb-2 text-sm text-gray-400 h-6">{typingStatus}</div>
            <MessageInput onSendMessage={handleSendMessage} room={room} username={user.username} />
        </main>
    );
}

// --- Message Bubble Component ---
function MessageBubble({ msg }) {
    const { user } = useAuth();
    const isMe = msg.sender === user.userId;
    return (
        <div className={`flex items-start gap-3 ${isMe ? 'flex-row-reverse' : ''}`}>
            <div className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center font-bold text-white ${isMe ? 'bg-blue-500' : 'bg-gray-700'}`}>
                {msg.username.charAt(0).toUpperCase()}
            </div>
            <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                <div className={`text-sm font-bold ${isMe ? 'text-blue-400' : 'text-gray-300'} mb-1`}>
                    {msg.username}
                </div>
                <div className={`px-4 py-2 rounded-lg max-w-xs lg:max-w-md ${isMe ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-200'}`}>
                    <p className="text-sm">{msg.text}</p>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                    {new Date(msg.timestamp).toLocaleTimeString()}
                </div>
            </div>
        </div>
    );
}

// --- Message Input Component ---
function MessageInput({ onSendMessage, room, username }) {
    const [text, setText] = useState('');
    const typingTimeoutRef = useRef(null);

    const handleTyping = (e) => {
        setText(e.target.value);
        if (!typingTimeoutRef.current) {
            socket.emit('typing', { room, username });
        } else {
            clearTimeout(typingTimeoutRef.current);
        }

        typingTimeoutRef.current = setTimeout(() => {
            socket.emit('stop-typing', room);
            typingTimeoutRef.current = null;
        }, 2000);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSendMessage(text);
        setText('');
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = null;
    };

    return (
        <footer className="p-4 bg-gray-800 border-t border-gray-700">
            <form onSubmit={handleSubmit} className="flex items-center space-x-3">
                <input
                    type="text"
                    value={text}
                    onChange={handleTyping}
                    placeholder="Type a message..."
                    className="w-full px-4 py-2 bg-gray-700 border-gray-600 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                    autoComplete="off"
                />
                <button type="submit" className="bg-blue-600 text-white font-semibold p-3 rounded-full hover:bg-blue-700 transition duration-300">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                </button>
            </form>
        </footer>
    );
}

// --- Online Users Panel Component ---
function OnlineUsersPanel({ onlineUsers }) {
    return (
        <aside className="hidden md:block md:col-span-3 lg:col-span-3 bg-gray-800 border-l border-gray-700 flex-col">
            <div className="p-4 border-b border-gray-700">
                <h2 className="text-xl font-bold text-white">Online ({onlineUsers.length})</h2>
            </div>
            <div className="p-4 space-y-3">
                {onlineUsers.map(username => (
                    <div key={username} className="flex items-center space-x-3">
                        <div className="relative">
                            <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center font-bold text-white text-xl">
                                {username.charAt(0).toUpperCase()}
                            </div>
                            <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-green-400 ring-2 ring-gray-800"></span>
                        </div>
                        <span className="font-medium">{username}</span>
                    </div>
                ))}
            </div>
        </aside>
    );
}
