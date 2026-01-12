import { createContext, useContext, useState, useEffect } from 'react';

const SocketContext = createContext();

export const SocketProvider = ({children, socket}) => {
  const [prompt, setPrompt] = useState([]);
  const [story, setStory] = useState([]);
  const [responses, setResponses] = useState({});
  const [endTime, setEndTime] = useState(0);

  useEffect(() => {
    socket.on('new prompt', (data) => {
      setPrompt(data.words);
      setResponses({});
      setEndTime(data.endsAt);
    });

    socket.on('sync prompt', (data) => {
      setPrompt(data.words);
      setResponses(data.responses);
      setStory(data.currentCanon);
      setEndTime(data.endsAt);
    });

    socket.on('new post', (responseId, responseObject) => {
      setResponses(prevState => {
        return {
          ...prevState,
          [responseId]: responseObject
        }
      });
    });

    socket.on('vote', (responseId, delta) => {
      setResponses(prevState => {
        return {
          ...prevState,
          [responseId]: {
            ...prevState[responseId],
            votes: prevState[responseId].votes + delta
          }
        }
      });
    });

    socket.on('round end', (winningText) => {
      setStory(prevState => prevState.concat(winningText));
    });

    socket.on('story end', () => {
      setStory([]);
    })

    // cleanup function... just in case
    // I'm not sure this is necessary for an empty dependency list
    return () => {
      socket.removeAllListeners();
    };
  }, []);

  return (
    <SocketContext.Provider value={{
      prompt,
      story,
      responses,
      endTime,
      socket
    }}>
      {children}
    </SocketContext.Provider>
  );

};

export const useSocket = () => {
  return useContext(SocketContext);
};
