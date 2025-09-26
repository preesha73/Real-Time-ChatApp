import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';

// --- Axios and Socket.IO Setup ---
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const socket = io(API_URL);

// --- Reusable Components ---
const AuthForm = ({ isLogin, onSubmit, error, setError }) => {
    const [displayName, setDisplayName] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!isLogin && password !== confirmPassword) {
            setError("Passwords don't match!"); // Use state for errors instead of alert
            return;
        }
        setError(''); // Clear previous errors
        onSubmit({ displayName, password });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <h2 className="text-2xl font-bold text-center text-white">{isLogin ? 'Login' : 'Register'}</h2>
            <div>
                <label className="block text-sm font-medium text-gray-300">Display Name</label>
                <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    required
                    className="w-full px-3 py-2 mt-1 text-white bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-300">Password</label>
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full px-3 py-2 mt-1 text-white bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder={isLogin ? "Enter your password" : ""}
                />
            </div>
          {!isLogin && (
                 <div>
                    <label className="block text-sm font-medium text-gray-300">Confirm Password</label>
                    <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        className="w-full px-3 py-2 mt-1 text-white bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
            )}
            {error && <p className="text-sm text-center text-red-400">{error}</p>}
            <button type="submit" className="w-full py-2 font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-blue-500 transition-colors duration-300">
                {isLogin ? 'Login' : 'Create Account'}
            </button>
        </form>
    );
};

const AuthPage = ({ setAuthInfo }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [error, setError] = useState('');

    const handleAuth = async (credentials) => {
        const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
        try {
            // For login, send both displayName and password directly to the login endpoint.
            // (Don't call protected /api/auth/users without a token — that caused the 401 error.)
            const authCredentials = isLogin
                ? { displayName: credentials.displayName, password: credentials.password }
                : credentials;


            const { data } = await axios.post(`${API_URL}${endpoint}`, authCredentials);
            setAuthInfo({ token: data.token, user: data.user });
            localStorage.setItem('chat-app-auth', JSON.stringify({ token: data.token, user: data.user }));
        } catch (err) {
            if (err.response) {
                // The server responded with an error (e.g., wrong password)
                setError(err.response.data.message || 'An unknown server error occurred.');
            } else if (err.request) {
                // The request was made but no response was received (server is likely down or asleep)
                setError('Could not connect to the server. It might be waking up. Please try again in a minute.');
            } else {
                // Something else went wrong
                setError('An error occurred while sending the request.');
            }
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-900">
            <div className="w-full max-w-md p-8 space-y-8 bg-gray-800 rounded-lg shadow-lg">
                <div className="flex border-b border-gray-600">
                    <button onClick={() => setIsLogin(true)} className={`flex-1 py-2 text-center font-medium ${isLogin ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400'}`}>Login</button>
                    <button onClick={() => setIsLogin(false)} className={`flex-1 py-2 text-center font-medium ${!isLogin ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400'}`}>Register</button>
                </div>
                {/* We need to pass setError to the form now */}
                <AuthForm isLogin={isLogin} onSubmit={handleAuth} error={error} setError={setError} />
            </div>
        </div>
    );
};

const ChatPage = ({ authInfo, setAuthInfo }) => {
    // This component's code remains the same as before
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [allUsers, setAllUsers] = useState([]);
    const [onlineUserIds, setOnlineUserIds] = useState([]);
    const [typingUsers, setTypingUsers] = useState({});
    const [rooms, setRooms] = useState(['general', 'random', 'support']);
    const [activeRoom, setActiveRoom] = useState('general');
    const messagesEndRef = useRef(null);
    const typingTimeoutRef = useRef(null);


    // Effect for fetching initial data
    useEffect(() => {
        const fetchMessages = async () => {
            try {
                const { data } = await axios.get(`${API_URL}/api/messages`, {
                    headers: { Authorization: `Bearer ${authInfo.token}` }
                });
                // filter messages for the active room
                setMessages(data.filter(m => m.room === activeRoom));
            } catch (error) {
                console.error("Error fetching messages", error);
            }
        };

        const fetchUsers = async () => {
             try {
                const { data } = await axios.get(`${API_URL}/api/auth/users`, {
                    headers: { Authorization: `Bearer ${authInfo.token}` }
                });
                setAllUsers(data);
            } catch (error) {
                console.error("Error fetching users", error);
            }
        }

        fetchMessages();
        fetchUsers();
    }, [authInfo.token]);


    // Effect for Socket.IO events
    useEffect(() => {
        socket.emit('user-online', authInfo.user.id);
        // join the active room
        socket.emit('join-room', activeRoom);

        socket.on('receive-message', (message) => {
            // only append messages for the current active room
            if (message.room === activeRoom) {
                setMessages(prevMessages => [...prevMessages, message]);
            }
            setTypingUsers(prev => {
                const newTypingUsers = {...prev};
                delete newTypingUsers[message.sender._id];
                return newTypingUsers;
            });
        });

        socket.on('update-online-users', (userIds) => {
            setOnlineUserIds(userIds);
        });
        
        socket.on('user-typing', (data) => {
            setTypingUsers(prev => ({...prev, [data.userId]: data.displayName }));
        });

        socket.on('user-stopped-typing', (data) => {
            setTypingUsers(prev => {
                const newTypingUsers = {...prev};
                delete newTypingUsers[data.userId];
                return newTypingUsers;
            });
        });


        return () => {
            socket.off('receive-message');
            socket.off('update-online-users');
            socket.off('user-typing');
            socket.off('user-stopped-typing');
        };
    }, [authInfo.user.id]);

    // Rejoin new room and fetch messages when activeRoom changes
    useEffect(() => {
        socket.emit('join-room', activeRoom);
        // fetch messages for the new room
        (async () => {
            try {
                const { data } = await axios.get(`${API_URL}/api/messages`, {
                    headers: { Authorization: `Bearer ${authInfo.token}` }
                });
                setMessages(data.filter(m => m.room === activeRoom));
            } catch (err) {
                console.error('Error fetching room messages', err);
            }
        })();
    }, [activeRoom]);

    // Effect for auto-scrolling
     useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);


    const handleSendMessage = (e) => {
        e.preventDefault();
        if (newMessage.trim()) {
            const messageData = {
                text: newMessage,
                senderId: authInfo.user.id,
                room: activeRoom,
            };
            socket.emit('send-message', messageData);
            socket.emit('stop-typing', { userId: authInfo.user.id, displayName: authInfo.user.displayName });
            if(typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
            setNewMessage('');
        }
    };
    
    const handleTyping = (e) => {
        setNewMessage(e.target.value);

        if (!socket) return;
        
        if (!typingTimeoutRef.current) {
             socket.emit('typing', { userId: authInfo.user.id, displayName: authInfo.user.displayName, room: activeRoom });
        }
        
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        typingTimeoutRef.current = setTimeout(() => {
            socket.emit('stop-typing', { userId: authInfo.user.id, displayName: authInfo.user.displayName, room: activeRoom });
            typingTimeoutRef.current = null;
        }, 2000);
    };

    const handleLogout = () => {
        localStorage.removeItem('chat-app-auth');
        setAuthInfo(null);
    };
    
    const onlineUsersList = allUsers.filter(user => onlineUserIds.includes(user._id));

    const typingIndicator = Object.values(typingUsers).join(', ');

    return (
        <div className="flex h-screen bg-gray-900 text-white">
            <div className="w-64 bg-gray-800 flex flex-col">
                <div className="p-4 border-b border-gray-700"><h1 className="text-xl font-bold">MERN Chat</h1></div>
                <div className="flex-1 p-4 space-y-2">
                    {rooms.map(r => (
                        <div key={r} onClick={() => setActiveRoom(r)} className={`px-3 py-2 rounded-md cursor-pointer ${r === activeRoom ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-200'}`}>
                            # {r}
                        </div>
                    ))}
                </div>
                <div className="p-4 border-t border-gray-700 flex items-center">
                    <div className="flex-1"><p className="font-semibold">{authInfo.user.displayName}</p><p className="text-xs text-green-400">Online</p></div>
                    <button onClick={handleLogout} className="px-3 py-1 text-sm bg-red-600 rounded hover:bg-red-700">Logout</button>
                </div>
            </div>

            <div className="flex-1 flex flex-col">
                <div className="flex-1 p-6 overflow-y-auto">
                     {messages.map(msg => (
                        <div key={msg._id} className={`flex mb-4 ${msg.sender._id === authInfo.user.id ? 'justify-end' : 'justify-start'}`}>
                            <div className={`rounded-lg px-4 py-2 max-w-lg ${msg.sender._id === authInfo.user.id ? 'bg-blue-600' : 'bg-gray-700'}`}>
                               <p className="text-sm font-bold text-gray-300">{msg.sender.displayName}</p>
                                <p className="text-white">{msg.text}</p>
                                <p className="text-xs text-right text-gray-400 mt-1">{new Date(msg.createdAt).toLocaleTimeString()}</p>
                            </div>
                        </div>
                    ))}
                    <div ref={messagesEndRef} />
                </div>
                
                <div className="h-6 px-6 text-sm text-gray-400 italic">
                    {typingIndicator && `${typingIndicator} is typing...`}
                </div>

                <div className="p-6 bg-gray-800 border-t border-gray-700">
                    <form onSubmit={handleSendMessage} className="flex">
                        <input
                            type="text"
                            value={newMessage}
                            onChange={handleTyping}
                            placeholder="Type a message..."
                            className="flex-1 px-4 py-2 text-white bg-gray-700 border border-gray-600 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button type="submit" className="px-6 py-2 font-semibold text-white bg-blue-600 rounded-r-md hover:bg-blue-700">Send</button>
                    </form>
                </div>
            </div>
            
            <div className="w-64 bg-gray-800 border-l border-gray-700 p-4">
                 <h2 className="text-lg font-bold mb-4">Online Users ({onlineUsersList.length})</h2>
                 <ul className="space-y-3">
                    {onlineUsersList.map(user => (
                         <li key={user._id} className="flex items-center">
                            <span className="w-3 h-3 bg-green-500 rounded-full mr-3"></span>
                            <span>{user.displayName}</span>
                        </li>
                    ))}
                 </ul>
            </div>
        </div>
    );
};


function App() {
    const [authInfo, setAuthInfo] = useState(() => {
        const savedAuth = localStorage.getItem('chat-app-auth');
        return savedAuth ? JSON.parse(savedAuth) : null;
    });

    return authInfo ? <ChatPage authInfo={authInfo} setAuthInfo={setAuthInfo} /> : <AuthPage setAuthInfo={setAuthInfo} />;
}

export default App;

