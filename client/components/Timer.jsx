import React, { useState, useEffect } from 'react';
import { useSocket } from './SocketContext.jsx';

const Timer = ({ timerOnly = false }) => {
  const {prompt, responses, endTime} = useSocket();
  console.log(endTime);

  // there's no need to render the prompt or number of responses on /home when you can just see them
  const renderPromptInfo = () => {
    if (timerOnly) {
      return null;
    } else {
      const numResponses = Object.keys(responses).length;
      return (
        <div>
          <p><strong>Prompt:</strong> {prompt.join(' ')}</p>
          <p>{numResponses} response{numResponses === 1 ? '' : 's'}</p>
        </div>
      );
    }
  }

  return (
    <div className="live-timer">
      {renderPromptInfo()}
      <p>Time left until the next prompt:</p>
      <p>{`${0} minutes ${0} seconds`}</p>
    </div>
  );
};
export default Timer