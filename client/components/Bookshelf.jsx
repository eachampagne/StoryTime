import React, {useState, useEffect} from 'react';
import axios from 'axios';
import {Link, useNavigate} from 'react-router-dom'
import { useAuth } from './AuthContext.jsx';
import Timer from './Timer.jsx';


const Bookshelf = () => {

    const navigate = useNavigate();

    // access the user state with data from context
    const { user, login, logout } = useAuth(); // this holds the object with the current logged in user
    const [userId, setUserId] = useState(user.id);
    const [userTexts, setUserTexts] = useState([]);
    const [userBadgesSt, setUserBadgesSt] = useState('');
    const [userBadgeObj, setUserBadgeObj] = useState({Likeable: 0, Contributor: 0, Matcher: 0})
    const [username, setUsername] = useState(user.username);
    const [badgeId, setBadgeId] = useState(1)

    // gets username from the user object

    /**
    * getUserID takes in the username that comes from the useAuth function. 'username' as a variable
    * gets set with useState. This GET request should only have one document with the users
    * information, and we grab the badges and the userId from the object.
    */
    const getUserId = (username) => {
      axios.get(`/user/${username}`) // checks if user is authorized
        .then((userData) => { // takes that  user object
          let user = userData.data[0]; // should only be one object - will need to have a way to have no duplicate names
            if (user.badges) {
              setUserBadgesSt(user.badges);
            }
            setUserId(user.id);
        })
        .catch((err) => {
          console.error('Could not retrieve user ID', err, props.user);
        });
    };

    /**
     * getSavedStories will take in the userId and search the database for and row that
     * has the userId as a value on the usersBookshelves table. With the response it returns,
     * it will set the UserTexts to that data so it can be displayed later. Also, the getSavedStories
     * was called again so that the user didn't need to refresh the page when making changes.
     * Reused the badge manipulating function that was already provided in the User component.
     */
    const getSavedStories = () => {
      axios.get(`/bookshelf/${userId}`)
      .then((res) => {
        setUserTexts(res.data);
      })
      .catch((err) => {
        console.error(err);
      });
    };
    useEffect(() => {
      getSavedStories();
    }, [])
    const manipulateBadgeData = () => {
      userBadgesSt.split('+').forEach((badge) => {
        if(badge.length > 0){
          setUserBadgeObj((userBadgeObj) => ({...userBadgeObj, [badge]: userBadgeObj[badge]+1}));
        }
      })
    }


    //runs when dom is compounded
    useEffect(() => {
      getUserId(username);
      // getStoryWithResponse(badgeId)
    }, []);

    //runs when userBadgeSt changes
    useEffect(() => {
      manipulateBadgeData();
    }, [userBadgesSt])

    /**
     * deleteStory allows the user to click the delete button on a story text
     * that they saved, and the savedStory gets complete deleted from the
     * usersBookshelves table. Once it is deleted, the story is gone forever.
     */
    const deleteStory = (textId) => {
      axios.delete(`/bookshelf/${userId}`, {data: {textId}})
        .then(() => {
          console.info('story deleted');
          getSavedStories();
        })
        .catch((err) => {
          console.error(err, 'Cannot delete story');
        })
    }

  /**
   * Everything in the return is what will be rendered to the page. It starts with the basics
   * buttons to go back to the homepage and user page. Then it shows a collection of
   * saved stories. Inside of these stories will also have the buttons for deleting
   * a story from the list. At the very bottom, badges are also being displayed.
   */
  return (
    <div>
      <nav>
        <Link to='/home' >
          <button className='user-home-button'>HomePage</button>
        </Link>
        <Link to='/user' >
          <button className='user-button'>User</button>
        </Link>
        <div>
          <button className='user-btn' onClick={ () => {
            logout();
            navigate({ pathname: '/' });
          } }>Logout</button>
        </div>
        <Timer/>
      </nav>
          <div>
              <h1 className='user-head'>MY SAVED STORIES</h1>
            <div className='user' >
                <div className='user-data'>
                  <ul className='user-ul'>
              {userTexts.map((entry) => { // probably going to need to replace this with the table of saved stories for that user
                  return (
                    <div key={entry.id} className='user-entry-box'>
                    <div
                        className='user-index'
                        entry={entry}
                      >
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
                      <button className="delete-btn" onClick={() => deleteStory(entry.id)}>Delete</button>
                    </div>
                  );
                })}
                  </ul>
                </div>
            </div>
            <h1 className='badges-header' >Badges</h1>
            </div>
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

export default Bookshelf;