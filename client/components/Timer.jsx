import React, { useState, useEffect } from 'react';
import { useSocket } from './SocketContext.jsx';

const Timer = ({ timerOnly = false }) => {
  const {prompt, responses, endTime} = useSocket();
  const [timeString, setTimeString] = useState('00:00');
  const [timer, setTimer] = useState(null);

  useEffect(() => {
    if (timer) {
      clearTimeout(timer);
    }
    refreshTimeString();
  }, [endTime]);

  const refreshTimeString = () => {
    const remainingMs = endTime - (new Date()).getTime();
    setTimeString(calculateTimeString(remainingMs));
    setTimer(setTimeout(refreshTimeString, 100)); // refreshes every tenth of a second
  };

  const calculateTimeString = (remainingMs) => {
    let negative = false;
    if (remainingMs < 0) {
      remainingMs = -remainingMs;
      negative = true;
    }

    const msPerS = 1000;
    const msPerMin = msPerS * 60;
    const msPerHr = msPerMin * 60;

    const hours = Math.floor(remainingMs / msPerHr);
    const minutes = Math.floor((remainingMs % msPerHr) / msPerMin);
    const seconds = Math.floor((remainingMs % msPerMin) / msPerS);

    const negativeString = negative ? '-' : '';
    const hourString = hours > 0 ? `${hours}:` : '';
    const minuteString = minutes === 0 ? '00'
      : minutes < 10 ? `0${minutes}` : `${minutes}`;
    const secondString = seconds === 0 ? '00'
      : seconds < 10 ? `0${seconds}` : `${seconds}`;

    return `${negativeString}${hourString}${minuteString}:${secondString}`;
  };

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
  };

  return (
    <div className="live-timer">
      {renderPromptInfo()}
      <p>Time left until the next prompt: {timeString}</p>
    </div>
  );
};
export default Timer