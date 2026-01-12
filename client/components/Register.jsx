import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext.jsx';

const Register = () => {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const navigate = useNavigate();

  const handleRegister = (e) => {
    e.preventDefault();

    // TODO: why does it even try to send without checking that username and password exist?
    // yeah the server checks for that, as it should, but why send a request that is so obviously going to fail?
    axios.post('/auth/register', { username, password })
      .then((response) => {
        if (response.status === 201) {
          const userData = {
            id: response.data.user_id,
            username: response.data.user_name
          };
          login(userData);

          // Registration successful, you can redirect to the login page or another route
          navigate({ pathname: '/home' });
        }
      })
      .catch((error) => {
        console.error('Failed to register:', error);
      })
  };

  return (
    <div className="register" >
      <h2>Register</h2>
      <form onSubmit={handleRegister}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit">Register</button>
      </form>
    </div>
  );
};

export default Register;