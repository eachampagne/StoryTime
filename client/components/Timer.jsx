import React, { useState, useEffect } from 'react';
import { useSocket } from './SocketContext.jsx';

const Timer = ({ timerOnly }) => {

  // there's no need to render the prompt or number of responses on /home when you can just see them
  const renderPromptInfo = () => {
    if (timerOnly) {
      return null;
    } else {
      return (
        <div>
          <h4>Other stuff</h4>
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