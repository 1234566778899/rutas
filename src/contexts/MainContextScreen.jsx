import React, { createContext, useState } from 'react'
export const MainContext = createContext();
export const MainContextScreen = ({ children }) => {
    const [position, setPosition] = useState(null);
    const [destination, setDestination] = useState(null);
    return (
        <MainContext.Provider value={{ position, setPosition, destination, setDestination }}>
            {children}
        </MainContext.Provider>
    )
}
