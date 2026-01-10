import { useEffect } from 'react';
import { AuthProvider } from './AuthContext.jsx';
import { SocketProvider } from './SocketContext.jsx';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Homepage from './Homepage.jsx';
import Login from './Login.jsx'
import User from './User.jsx';
import Post from './Post.jsx';
import Register from './Register.jsx';
import Bookshelf from './Bookshelf.jsx';
import { io } from 'socket.io-client';

const socket = io();

function App () {

  // useEffect(() => {
  //   const storedUserId = sessionStorage.getItem('user_id');
  //   const storedUserName = sessionStorage.getItem('user_name');

  //   if (storedUserId && storedUserName) {
  //     // User data found in sessionStorage, set the user state
  //     setUser({
  //       id: storedUserId,
  //       username: storedUserName,
  //     });
  //   }
  // }, []);

  // adding a route to the bookshelf component
  return (
    <AuthProvider>
      <SocketProvider socket={socket}>
        <div className='wrapper'>
          <Router>
            <Routes>
              <Route path="/" element={<Login/>} />
              <Route path="/register" element={<Register/>} />
              <Route path="/home" element={<Homepage/>} />
              <Route exact path="/user" element={<User/>} />
              <Route path="/text/id" element={<Post/>} />
              <Route path="/bookshelf" element={<Bookshelf />} />
            </Routes>
          </Router>
        </div>
      </SocketProvider>
    </AuthProvider>
    )
};
export default App