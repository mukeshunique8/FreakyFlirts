import React from 'react'

export default function Btn({name,style="bg-white",onClick}) {
  return (
    <div onClick={onClick} className={`${style} w-full cursor-pointer text-center flex justify-center rounded-xl items-center px-4 py-2`}>{name}</div>
  )
}
