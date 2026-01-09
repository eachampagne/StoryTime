import { createContext, useContext, useState, useEffect } from 'react';

const SocketContext = createContext();

export const SocketProvider = ({children, socket}) => {
  const [prompt, setPrompt] = useState([]);
  const [story, setStory] = useState([]);
  const [responses, setResponses] = useState({});
  const [endTime, setEndTime] = useState(0);

  useEffect(() => {
    socket.on('new prompt', (data) => {
      console.log(data);
      setPrompt(data.words);
      setResponses({});
    });

    socket.on('sync prompt', (data) => {
      console.log(data);
      setPrompt(data.words);
      setResponses(data.responses);
    });

    socket.on('new post', (responseId, responseObject) => {
      console.log(`received message from ${responseObject.username} that says ${responseObject.text}`);
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

    socket.on('round end', (data) => {
      // clear round-specific state data
      // rethinking this - it's causing a flicker
      // setProviderValue(prevState => {
      //   return {
      //     ...providerValue,
      //     prompt: [],
      //     story: [],
      //     responses: {},
      //     endTime: 0,
      //   }
      // });
    });

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
