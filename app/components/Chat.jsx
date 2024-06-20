import React, { useEffect, useRef, useState } from "react";
import { useAppContext } from "../utils/Appcontext";
import { TbLogout2 } from "react-icons/tb";
import { Input, Textarea } from "@chakra-ui/react";
import { IoReturnUpBack } from "react-icons/io5";
import { IoMdTime } from "react-icons/io";

import Cookies from "universal-cookie";
import {
  addDoc,
  collection,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  where,
} from "firebase/firestore";
import { auth, db } from "../utils/firebase";
import Image from "next/image";
import { FaArrowDown } from "react-icons/fa";
import { RiSendPlaneFill } from "react-icons/ri";

export default function Chat() {
  const cookie = new Cookies();
  const messageRef = collection(db, "messages");
  const { userData, isAuth, setIsAuth, room, setRoom, isChat, setIsChat } =
    useAppContext();

  const [newMessage, setNewMessage] = useState("");
  const [messages, setMessages] = useState([]);
  //   const displayName = userData?.name.split(" ")[0]; // Uncommented
  const displayName = "user"; // Uncommented
  const messagesEndRef = useRef(null);
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const queryMessages = query(
      messageRef,
      where("roomName", "==", room),
      orderBy("time")
    );
    const unsubscribe = onSnapshot(queryMessages, (snapshot) => {
      let msj = [];
      snapshot.forEach((doc) => {
        msj.push({ ...doc.data(), id: doc.id });
      });
      setMessages(msj);
    });

    return () => unsubscribe();
  }, []);

  function handleBack() {
    setIsChat(false);
  }
  function handlScroll() {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }
  function handleMsjInput(e) {
    setNewMessage(e.target.value);
  }
  async function handleSubmit(e) {
    e.preventDefault();

    const sendMessage = {
      text: newMessage,
      time: serverTimestamp(),
      name: auth.currentUser.displayName,
      roomName: room,
    };

    if (newMessage === "") return;
    await addDoc(messageRef, sendMessage);
    setNewMessage("");
  }

  function formatTimestamp(timestamp) {
    const date = timestamp.toDate();
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
  }

  return (
    <div className="w-full h-screen relative flex max-w-[440px]  flex-col text-cyan-500  px-3 py-3  justify-between items-center">
      <div className="text-[30px] px-2 font-bold w-full glass flex items-center justify-between">
        <h2 className="">{room ? `Room ID: ${room}` : "Room"}</h2>
        <IoReturnUpBack onClick={handleBack} size={30} color="cyan" />
      </div>

      <div className="flex relative h-full py-4 w-full flex-col overflow-hidden no-scrollbar items-end   text-white">
        <div
          className="absolute bottom-[30px] z-40 left-[30px]"
          onClick={handlScroll}
        >
          <FaArrowDown size={30} color="cyan" />
        </div>

        <div className="flex  w-full flex-col  gap-3 no-scrollbar overflow-scroll">
          {messages?.map((msj, idx) => (
            <div
              className={`${
                msj.name === auth.currentUser.displayName
                  ? "self-end"
                  : "self-start"
              } w-fit max-w-[80%]  min-w-[30%] flex flex-col glass px-2 py-1 gap-3`}
            >
              <div className="w-full flex justify-between">
                {msj?.name !== auth.currentUser.displayName && (
                  <p className="text-[12px]">{msj.name}</p>
                )}
                {/* <p className="text-[12px]">{msj?.name === auth.currentUser.displayName ? "You" :  msj.name}</p> */}
                {/* <div className="relative w-[25px] h-[25px] object-contain">
              <Image sizes="100%" fill src={auth?.currentUser?.photoURL} alt="user"/>
            </div> */}
              </div>
              <p key={idx} className="">
                {msj?.text}
              </p>
              <div className="w-full text-[10px] flex items-center gap-1 justify-end">
                <p>
                  <IoMdTime size={15} color="cyan" />
                </p>
                <p>{msj?.time ? formatTimestamp(msj.time) : "*"}</p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="p-2 w-full">
      <form onSubmit={handleSubmit} className="flex w-full gap-3 items-center">
        <Textarea
          height="80px"
          size="sm"
          color="black"
          bgColor="white"
          onChange={handleMsjInput}
          value={newMessage}
          className="w-[80%] h-auto min-h-[40px] text-[12px] overflow-auto resize-none no-scrollbar"
          placeholder="Start Typing...."
        />
        <button
          className="w-[20%] flex justify-center items-center text-center font-bold"
          type="submit"
        >
          <RiSendPlaneFill size={30} color="cyan" />
        </button>
      </form>
    </div>
    </div>
  );
}
