"use client";
import React from 'react';
import Btn from "../UI/Btn";
import { signInWithPopup } from 'firebase/auth';
import { auth, provider } from '../utils/firebase';
import { useAppContext } from '../utils/Appcontext';
import Cookies from 'universal-cookie';
import Image from 'next/image';

export default function Auth() {
  const { setUserData, setIsAuth } = useAppContext();
  const cookies = new Cookies();

  async function handleSignIn() {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = {
        name: result?.user.displayName,
        email: result?.user.email,
        photo: result?.user.photoURL
      };

      cookies.set("auth-token", result.user.refreshToken, { path: '/' });
      cookies.set("user-data", user, { path: '/' });

      setUserData(user);
      setIsAuth(true);
    } catch (error) {
      console.error("Error signing in:", error);
    }
  }

  return (
    <div className='w-full bg-white h-screen gap-3 flex flex-col justify-center items-center'>

      <div className='bg-white flex flex-col justify-between w-full items-center gap-5 p-4'>

      <div className='relative w-[300px] h-[300px] object-contain rounded-2xl'>
        <Image className='rounded-xl' sizes='100%' fill alt='Logo' src="/ff888.png"/>

      </div>

      <div className='w-fit'>
      <Btn onClick={handleSignIn} style="bg-white border-blue-600 border-[2px] text-blue-600" name="Sign in with Google"/>

      </div>
      </div>
    </div>
  );
}
