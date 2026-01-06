import React, {useState, useEffect} from 'react';
import axios from 'axios';
import {Link} from 'react-router-dom'
import { useAuth } from './AuthContext.jsx';

const Bookshelf = () => {

  console.log('test');
    // access the user state with data from context
    const { user, login, logout } = useAuth();

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
  


  return (
    <div>
      <Link to='/user' >
          <button className='user-button'>User</button>
      </Link>
          <div>
              <h1 className='user-head'>MY STORIES</h1>
            <div className='user' >
                <div className='user-data'>
                  <ul className='user-ul'>
              {userTexts.map((entry) => {
                  return (
                    <div key={entry.id} className='user-entry-box'>
                    <div
                        className='user-index'
                        entry={entry}
                      >
                        <div>
                          <strong>Username:</strong> {username}
                        </div>
                        <div>
                          {/* <strong>Story:</strong> {entry.prompt.matchWords} */}
                        </div>
                        <div>
                          <strong></strong> {entry.text}
                        </div>
                        <div className='small-text'>
                          <strong>Likes:</strong> {entry.likes}
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
            </div>
    </div>
    
  )
}

export default Bookshelf;