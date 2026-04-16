import React, {createContext, useState, useContext} from 'react';

const TimeModalContext = createContext<any>(null);

export const TimeModalProvider = ({children}: any) => {
  const [showModal, setShowModal] = useState(false);

  return (
    <TimeModalContext.Provider value={{showModal, setShowModal}}>
      {children}
    </TimeModalContext.Provider>
  );
};

export const useTimeModal = () => useContext(TimeModalContext);