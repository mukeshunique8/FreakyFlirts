import React, { useRef } from "react";
import { useAppContext } from "../utils/Appcontext";
import { TbLogout2 } from "react-icons/tb";
import { Input } from "@chakra-ui/react";
import Btn from "../UI/Btn";
import Cookies from "universal-cookie";
import { signOut } from "firebase/auth";
import { auth } from "../utils/firebase";
import Auth from "./Auth";

export default function Room() {
  const { userData, isAuth, setIsAuth, room, setRoom, isChat, setIsChat } =
    useAppContext();
    const displayName = userData?.name.split(" ")[0]; // Uncommented
  // const displayName = "user"; // Uncommented
  // console.log(displayName);
  const cookie = new Cookies();
  const roomRefInput = useRef(null);
 
  function handleRoomInput(e) {
    const input = roomRefInput.current.value;

    setRoom(input);
    setIsChat(true);
  }
  async function handleSignOut() {
   try{
    await signOut(auth);
    cookie.remove("user-data");
    cookie.remove("auth-token");
    setIsAuth(false);
    setRoom(null)
   }catch(err){
    console.log(err);
   }
  }

  return (
    <div className="w-full flex flex-col text-cyan-500  px-5 py-3  justify-start items-center">
      <div className="flex w-full justify-between px-3">
        <h2 className="text-[25px] font-bold rounded-none">
          {displayName ? `Hi, ${displayName}` : "Hi,..."}
        </h2>

        <div
          onClick={handleSignOut}
          className="flex cursor-pointer justify-center items-center"
        >
          <TbLogout2 size={30} color="cyan" />
        </div>
      </div>

      <div className="flex flex-col py-8 mt-8 justify-center  items-center w-[80%]">
        <div className="w-[80%] flex justify-center items-center">
          <Input ref={roomRefInput} placeholder="Room ID" />
        </div>
        <div className="w-[50%] pt-7 flex justify-center items-center">
          <Btn
            onClick={handleRoomInput}
            name="Enter Chat "
            style="bg-cyan-300 text-black font-bold"
          />
        </div>
      </div>
    </div>
  );
}
