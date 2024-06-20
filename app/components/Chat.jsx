import React, { useEffect, useRef, useState } from "react";
import { useAppContext } from "../utils/Appcontext";
import { IoReturnUpBack } from "react-icons/io5";
import { MdOutlineEmojiEmotions } from "react-icons/md";
import EmojiPicker from "emoji-picker-react";
import { IoMdTime } from "react-icons/io";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { deleteDoc, doc } from "firebase/firestore";
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
import { FaArrowDown } from "react-icons/fa";
import { RiSendPlaneFill } from "react-icons/ri";
import { IoMdAdd } from "react-icons/io";
import { Modal, Textarea, useDisclosure } from "@chakra-ui/react";

export default function Chat() {
  const cookie = new Cookies();
  const messageRef = collection(db, "messages");
  const { userData, isAuth, setIsAuth, room, setRoom, isChat, setIsChat } =
    useAppContext();
  const storage = getStorage();

  const [isAtBottom, setIsAtBottom] = useState(true);
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [file, setFile] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [selectedMessageId, setSelectedMessageId] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const messagesEndRef = useRef(null);
  const longPressTimer = useRef(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

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

  useEffect(() => {
    const handleScroll = () => {
      if (!messagesEndRef.current) return;
      const { scrollTop, scrollHeight, clientHeight } =
        messagesEndRef.current.parentNode;
      setIsAtBottom(scrollHeight - scrollTop === clientHeight);
    };

    if (messagesEndRef.current) {
      messagesEndRef.current.parentNode.addEventListener(
        "scroll",
        handleScroll
      );
    }

    return () => {
      if (messagesEndRef.current) {
        messagesEndRef.current.parentNode.removeEventListener(
          "scroll",
          handleScroll
        );
      }
    };
  }, []);

  function selectFileUpload() {
    setShowFileUpload((prev) => !prev);
  }

  function selectEmojiPicker() {
    setShowEmojiPicker((prev) => !prev);
  }

  function handleEmojiClick(emojiObject) {
    setNewMessage((prev) => prev + emojiObject.emoji);
    setShowEmojiPicker(false);
  }

  function handleBack() {
    setIsChat(false);
  }

  function handleScrollToBottom() {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }

  function handleMsjInput(e) {
    setNewMessage(e.target.value);
  }

  async function handleImageUpload(e) {
    const file = e.target.files[0];
    if (!file) {
      setShowFileUpload(false);
      return;
    }

    setFile(file);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    let imageUrl = null;

    if (file) {
      const imageRef = ref(storage, `images/${file.name}`);
      await uploadBytes(imageRef, file);
      imageUrl = await getDownloadURL(imageRef);
    }

    const sendMessage = {
      text: newMessage,
      time: serverTimestamp(),
      name: auth.currentUser.displayName,
      roomName: room,
      imageUrl: imageUrl || null,
    };

    if (newMessage === "" && !imageUrl) return;
    await addDoc(messageRef, sendMessage);
    setNewMessage("");
    setFile(null);
  }

  async function handleDeleteMessage() {
    if (selectedMessageId) {
      await deleteDoc(doc(db, "messages", selectedMessageId));
      setSelectedMessageId(null);
      onClose();
    }
  }

  function handleLongPress(id) {
    setSelectedMessageId(id);
    onOpen();
  }

  function handleCloseBtn() {
    setSelectedMessageId(null);
    onClose();
  }

  function formatTimestamp(timestamp) {
    const date = timestamp.toDate();
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
  }

  return (
    <div className="w-full h-screen relative flex max-w-[440px] flex-col text-cyan-500 px-3 py-3 justify-between items-center">
      <div className="text-[30px] px-2 font-bold w-full glass flex items-center justify-between">
        <h2 className="">{room ? `Room ID: ${room}` : "Room"}</h2>
        <IoReturnUpBack onClick={handleBack} size={30} color="cyan" />
      </div>

      <div className="flex relative h-full py-4 w-full flex-col overflow-hidden no-scrollbar items-end text-white">
        {!isAtBottom && (
          <div
            className="absolute bottom-[30px] z-20 left-[30px]"
            onClick={handleScrollToBottom}
            style={{ cursor: "pointer" }} // Ensure cursor style here
          >
            <FaArrowDown size={30} color="cyan" />
          </div>
        )}

        <div className="flex w-full flex-col gap-3 no-scrollbar overflow-scroll">
          {messages?.map((msj, idx) => (
            <div
              key={idx}
              onMouseDown={() =>
                (longPressTimer.current = setTimeout(
                  () => handleLongPress(msj.id),
                  800
                ))
              }
              onMouseUp={() => clearTimeout(longPressTimer.current)}
              onMouseLeave={() => clearTimeout(longPressTimer.current)}
              className={`${
                msj.name === auth.currentUser.displayName
                  ? "self-end"
                  : "self-start"
              } w-fit max-w-[80%] min-w-[30%] flex flex-col glass px-2 py-1 gap-3 ${
                selectedMessageId === msj.id
                  ? "border-[2px] border-red-600"
                  : ""
              }`}
            >
              <div className="w-full flex justify-between">
                {msj?.name !== auth.currentUser.displayName && (
                  <p className="text-[12px] text-cyan-600">{msj.name}</p>
                )}
              </div>
              <p className="">{msj?.text}</p>
              {msj?.imageUrl && (
                <div className="w-full flex justify-center">
                  <img
                    src={msj.imageUrl}
                    alt="Uploaded"
                    className="max-h-[200px]"
                  />
                </div>
              )}
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

     
  <div className=" w-full">
    <form
      onSubmit={handleSubmit}
      className={`${showEmojiPicker? "rounded-b-none" :"rounded-2xl"} flex justify-center rounded-2xl p-2 relative bg-white w-full gap-3 items-center`}
    >
      <Textarea
        height="60px"
        size="sm"
        color="black"
        border="none"            
        onChange={handleMsjInput}
        value={newMessage}
        className="w-[80%] h-auto min-h-[40px] text-[12px] overflow-auto resize-none no-scrollbar"
        placeholder="Start Typing...."
      />
      {showFileUpload && (
        <div className="absolute left-[10px] w-[200px] overflow-hidden top-[40px]">
          <input
            className="text-[12px]"
            type="file"
            accept="image/*"
            onChange={(e) => handleImageUpload(e)}
          />
        </div>
      )}

     <div className="bg-black min-h-[40px] flex justify-evenly rounded-2xl px-2 gap-3 items-center">
     <IoMdAdd
        className="cursor-pointer"
        onClick={selectFileUpload}
        size={30}
        color="cyan"
      />

     
      <MdOutlineEmojiEmotions
        className="cursor-pointer"
        onClick={selectEmojiPicker}
        size={30}
        color="cyan"
      />

      <button
        className="w-[20%] flex justify-center items-center text-center font-bold"
        type="submit"
      >
        <RiSendPlaneFill size={30} color="cyan" />
      </button>
     </div>
    </form>
    {showEmojiPicker && (
        <div className="flex w-full  bg-white justify-center items-center">
          <EmojiPicker size={40} bgColor="none" width="100%" onEmojiClick={handleEmojiClick} />
        </div>
      )}
  </div>

      {/* Confirmation Modal */}
  {isOpen && (
    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white flex flex-col justify-center items-center p-4 rounded">
        <p>Are you sure you want to delete this message?</p>
        <div className="flex gap-4 mt-4">
          <button
            onClick={handleDeleteMessage}
            className="bg-red-500 text-white px-4 py-2 rounded"
          >
            Delete
          </button>
          <button
            onClick={handleCloseBtn}
            className="bg-gray-300 px-4 py-2 rounded"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )}
    </div>
  );
}
