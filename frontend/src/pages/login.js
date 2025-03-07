// src/pages/Login.js
import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const socket = io('http://localhost:8080');
    setSocket(socket);

    socket.on('loginResponse', (response) => {
      if (response.success) {
        localStorage.setItem('token', response.token);
        window.location.href = '/game';
      } else {
        setError(response.message);
      }
    });

    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    setError('');

    if (socket) {
      socket.emit('login', { username, password });
    }
  };

  return (
    <div className="login-container">
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        <div className="form-group">
          <label>Username:</label>
          <input 
            type="text" 
            value={username} 
            onChange={(e) => setUsername(e.target.value)} 
            required 
          />
        </div>
        <div className="form-group">
          <label>Password:</label>
          <input 
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required 
          />
        </div>
        {error && <p className="error">{error}</p>}
        <button type="submit">Login</button>
      </form>
    </div>
  );
};

export default Login;
