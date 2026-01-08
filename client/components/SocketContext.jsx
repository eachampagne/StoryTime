import { createContext, useContext, useState, useEffect } from 'react';

const SocketContext = createContext();

export const SocketProvider = ({children, socket}) => {
  const [providerValue, setProviderValue] = useState({
    prompt: [],
    story: [],
    responses: [],
    endTime: 0,
    socket
  });

  useEffect(() => {
    socket.on('new prompt', (data) => {
      console.log(data);
      setProviderValue({
        ...providerValue,
        prompt: data.words
      });
    });

    socket.on('sync prompt', (data) => {
      console.log(data);
      setProviderValue({
        ...providerValue,
        prompt: data.words
      });
    });

    // cleanup function... just in case
    // I'm not sure this is necessary for an empty dependency list
    return () => {
      socket.removeAllListeners('new prompt');
      socket.removeAllListeners('sync prompt');
    };
  }, []);

  return (
    <SocketContext.Provider value={providerValue}>
      {children}
    </SocketContext.Provider>
  );

};

export const useSocket = () => {
  return useContext(SocketContext);
};
