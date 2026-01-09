import React, { useState, useEffect} from 'react';
import UpVote from './UpVote.jsx';
//import axios from 'axios';
import { useAuth } from './AuthContext.jsx';

const Post = ({text, postId}) => {
  //console.log(username)
    // access the user state with data from context
  const { user, logout } = useAuth();

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



  return (
    <div className="text-container">
      <div className="upvote-container">
       </div>
        <div className='text-context'>
      <p> <strong>{text.username}: </strong>{text.text} </p>
      <UpVote text={text} postId={postId}/>
      <p className='timeStamp'>{newTimeStamp}</p>
    </div>
    </div>
  )
}

export default Post;