import React, {useState, useEffect} from 'react';
import axios from 'axios';
import {Link, useNavigate} from 'react-router-dom'
import { useAuth } from './AuthContext.jsx';
import Timer from './Timer.jsx';
// import { Navigate } from 'react-router-dom';

const User = () => {
  const navigate = useNavigate();

  // access the user state with data from context
  const { user, login, logout } = useAuth();

  // // Check if the user is authenticated before rendering content
  // if (!user) {
  //   // Redirect or show a message to unauthenticated users
  //   return <Navigate to="/" />;
  // }

  const [userId, setUserId] = useState(user.id);
  const [userTexts, setUserTexts] = useState([]);
  const [userBadgesSt, setUserBadgesSt] = useState('');
  const [userBadgeObj, setUserBadgeObj] = useState({Likeable: 0, Contributor: 0, Matcher: 0})
  const [username, setUsername] = useState(user.username);
  const [badgeId, setBadgeId] = useState(1)
  const [newUsername, setNewUsername] = useState('');

 
  const getUserId = (username) => {
    axios.get(`/user/${username}`)
      .then((userData) => {
        let user = userData.data[0];
          if (user.badges) {
            setUserBadgesSt(user.badges)
          }
          setUserId(user.id);
      })
      .catch((err) => {
        console.error('Could not retrieve user ID', err, props.user)
      });
  };
 
  const manipulateBadgeData = () => {
    userBadgesSt.split('+').forEach((badge) => {
      if(badge.length > 0){
        setUserBadgeObj((userBadgeObj) => ({...userBadgeObj, [badge]: userBadgeObj[badge]+1}));
      }
    })
  }

  //axios request to retrieve user texts by id
  const getStoryWithResponse = (badgeId) => {
    axios.get(`/text/user/${userId}`)
    .then((texts) =>{
      setUserTexts(texts.data);
    })
    .catch((err) => {
      console.error('Could not retrieve texts!!', err);
    });
  };

  // Function to update the username
  const handleUpdateUsername = () => {
    axios
      .put(`/user/${userId}`, { username: newUsername })
      .then((response) => {
        // Update the username in context
        login({ ...user, username: newUsername });
        setUsername(newUsername); // Update the local state
      })
      .catch((error) => {
        console.error('Could not update username', error);
      });
  };

  //runs when dom is compounded
  useEffect(() => {
    getUserId(username);
    getStoryWithResponse(badgeId)
  }, []);
  
  //runs when userBadgeSt changes
  useEffect(() => {
    manipulateBadgeData();
  }, [userBadgesSt])

  // adding a link thats a button - when clicked opens the /bookshelf - bookshelf component
  return (
    <div>
      <nav>
        <Link to='/home' >
          <button className='user-home-button'>HomePage</button>
        </Link>
        <Link to='/bookshelf' >
          <button className='user-bookshelf-button'>Bookshelf</button>
        </Link>
        <div>
          <button className='user-btn' onClick={ () => {
            logout();
            navigate({ pathname: '/' });
          } }>Logout</button>
        </div>
        <Timer/>
      </nav>
        <h1 className='user-head'>MY STORIES</h1>
      <div className='user' >
          <div className='user-data'>
            <ul className='user-ul'>
        {userTexts.map((entry) => {
          console.log(entry)
            return (
              <div key={entry.id} className='user-entry-box'>
              <div
                  className='user-index'
                  entry={entry}
                >
                  <div>
                    <strong>Username: {username}</strong>
                  </div>
                  <div>
                    {/* <strong>Story:</strong> {entry.prompt.matchWords} */}
                  </div>
                  <div>
                    <strong>{entry.text}</strong>
                  </div>
                  <div className='small-text'>
                    <strong>Likes: {entry.likes}</strong>
                     &nbsp;&nbsp;&nbsp;
                    {/* <strong>Created:</strong> {entry.prompt.createdAt.substring(0, 10)} */}

                  </div>
                </div>
              </div>
            );
          })}

            </ul>
          </div>
      <div className="username-update">
        <div className="username-label">
          <strong>{username}</strong> 
        </div>
        <div className="update-username">
          <input
            type="text"
            placeholder="New Username"
            value={newUsername}
            onChange={(e) => setNewUsername(e.target.value)}
          />
          <button onClick={handleUpdateUsername}>Update</button>
        </div>
      </div>
      </div>
      <h1 className='badges-header' >Badges</h1>
      <div>
        {
          Object.entries(userBadgeObj).map((category, i) => {
            if(category[1] >= 10) {
              return <div><div className='gold-badge' id={i}>{category[0]}</div><br/></div>
            }
            if(category[1] >= 5) {
              return <div><div className='bronze-badge' id={i}>{category[0]}</div><br/></div>
            }
            if(category[1] > 0 ) {
              return <div><div className='silver-badge' id={i}>{category[0]}</div><br/></div>
            }
          })
        }
      </div>
    </div>
  )
}

export default User;
