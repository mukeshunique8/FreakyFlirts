"use client";
import React, { useEffect } from "react";
import { useAppContext } from "./utils/Appcontext";
import Chat from "./components/Chat";
import Auth from "./components/Auth";
import Room from "./components/Room";

export default function Page() {
  const { isAuth, room, isChat,setRoom } = useAppContext();

  if (!isAuth) {
    return (
      <div className="max-w-[440px] h-screen mx-auto bg-black flex flex-col justify-start items-center">
        <Auth />
      </div>
    );
  }

  return (
    <div className="max-w-[440px] h-screen mx-auto bg-black flex flex-col justify-start items-center">
      {isChat ? <Chat /> : <Room />}
    </div>
  );
}
