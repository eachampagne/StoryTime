import React, { useState, useEffect} from 'react';
import UpVote from './UpVote.jsx';
import axios from 'axios';
import { useAuth } from './AuthContext.jsx';

const Post = ({textId, text}) => {
  //console.log(username)
    // access the user state with data from context
    console.log(textId, 'this is a key')
  const { user, logout } = useAuth();
  console.log(user.username)
  const [userId, setUserId] = useState(user.id);

  //const [username, setUsername] = useState('');
  const [newTimeStamp, setNewTimeStamp] = useState('')
  useEffect(() => {
    // axios.get(`/text/user/${user.id}/${user.username}`)
    // .then((res) => {
    //   setUsername(res.data.user.username)
    // })
    // .catch((err) => {
    //   console.error("err", err);

    // })


    const timeStamp = new Date();
    const formattedDate = timeStamp.toLocaleString('en-US', {
      year: 'numeric',
        month: 'long',
        day: 'numeric',
    })
  
    const formattedTime = timeStamp.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: 'numeric',
    });
  
    setNewTimeStamp(`${formattedTime}-${formattedDate}`);
  
  }, []);

  // post request for the save-btn
  const saveButton = () => {
    console.log(textId, 'HERE IS THE TEST ID')
    axios.post('/bookshelf', {params: {userId, textId}})
      .catch((err) => {
        console.error(err, 'error in post request for saveButton');
      })
  }
saveButton()
  return (
    <div className="text-container">
      <div className="upvote-container">
       </div>
        <div className='text-context'>
      <p> <strong>{user.username}: </strong>{text.text} </p>
      <UpVote text={text}/>
      <p className='timeStamp'>{newTimeStamp}</p>
      <button className='save-btn'>Save</button>
    </div>
    </div>
  )
}

export default Post;