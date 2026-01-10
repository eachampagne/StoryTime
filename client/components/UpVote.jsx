import React, { useState } from 'react';
import { useSocket } from './SocketContext.jsx';

const UpVote = ({text, postId}) => {
  const { socket } = useSocket();
  const { votes: likes } = text;
  const [voteStatus, setVoteStatus] = useState(0); // -1 is downvote, 0 is neutral, 1 is upvote

  const handleVote = (event) => {
    const action = event.target.name;
    let newVoteStatus;

    if (action === 'upvote') {
      if (voteStatus === 1) {
        newVoteStatus = 0; // toggle off upvote without downvoting
      } else {
        newVoteStatus = 1;
      }
    } else { // downvote
      if (voteStatus === -1) {
        newVoteStatus = 0; // toggle off downvote without upvoting
      } else {
        newVoteStatus = -1;
      }
    }

    const delta = newVoteStatus - voteStatus;
    setVoteStatus(newVoteStatus);

    socket.emit('vote', postId, delta);
  };

  return (
    <div>
        <button className='upvote-btn' name='upvote' onClick={handleVote}>{voteStatus === 1 ? '🔼' : '🔺'}</button>
        <span>{likes}</span>
        <button className='upvote-btn' name='downvote' onClick={handleVote}>{voteStatus === -1 ? '🔽' : '🔻'}</button>
    </div>
  )
}
export default UpVote;