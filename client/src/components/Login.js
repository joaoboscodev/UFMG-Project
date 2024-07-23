// src/components/Login.js

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../Styles/Login.css';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();
      if (response.ok) {
        alert('Login successful!');
        navigate('/news'); // Redirecionar para a página de News
      } else {
        alert(`Login failed: ${data.message}`);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Login failed: An error occurred');
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-image">
          <h1>Welcome to UFMG website</h1>
          <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
        </div>
        <div className="login-form">
          <h2>Entrar</h2>
          <form onSubmit={handleSubmit}>
            <div>
              <label>
                Usuário:
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </label>
            </div>
            <div>
              <label>
                Senha:
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </label>
            </div>
            <button type="submit">Login</button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;
