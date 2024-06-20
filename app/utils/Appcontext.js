"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import Cookies from "universal-cookie";

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const cookies = new Cookies();
//   const [isAuth, setIsAuth] = useState(!cookies.get('auth-token'));
  const [isAuth, setIsAuth] = useState(cookies.get('auth-token'));
  const [userData, setUserData] = useState(cookies.get('user-data') || {});
  const [room, setRoom] = useState("");
  const [isChat, setIsChat] = useState(false);

  useEffect(() => {
    const storedAuthToken = cookies.get("auth-token");
    const storedUserData = cookies.get("user-data");

    if (storedAuthToken) {
      setIsAuth(true);
    }

    if (storedUserData) {
      setUserData(storedUserData);
    }
  }, []);

  return (
    <AppContext.Provider value={{ isAuth, setIsAuth, userData, setUserData,room, setRoom,isChat, setIsChat }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);
