import React, { useState, useEffect} from 'react';
import UpVote from './UpVote.jsx';
import axios from 'axios';
import { useAuth } from './AuthContext.jsx';

const Post = ({text, postId}) => {
  // access the user state with data from context
  const { user, logout } = useAuth();

  const [newTimeStamp, setNewTimeStamp] = useState('')
  useEffect(() => {
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
  
    // this has no basis in reality - what if the post was submitted 10 minutes ago
    // (assuming rounds are longer) and the client is just syncing up now?
    // the correct solution is to save the timestamp on the responseObject when the server receives the text
    // but I'm out of time, sorry developers of the future
    setNewTimeStamp(`${formattedTime}-${formattedDate}`);
  
  }, []);

  // post request for the save-btn
  const saveButton = () => {
    axios.post(`/bookshelf/${user.id}`, {textId: postId})
      .catch((err) => {
        console.error(err, 'error in post request for saveButton');
      })
  }

  return (
    <div className="text-container">
      <div className="upvote-container">
       </div>
        <div className='text-context'>
      <p> <strong>{text.username}: </strong>{text.text} </p>
      <UpVote text={text} postId={postId}/>
      {/*
        Timestamp should go here but the time data should come from the server,
        not be the time this component happens to be rendered
        <p className='timeStamp'>{newTimeStamp}</p>
      */}
      <button className='save-btn' onClick={saveButton}>Save</button>
    </div>
    </div>
  )
}

export default Post;