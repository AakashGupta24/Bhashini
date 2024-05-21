import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import BankCard from './BankCard'
import RecordingButtons from './FixedButton'
import { IoMdNotificationsOutline } from "react-icons/io";
const RightSidebar = ({user,transactions,banks}) => {
  return (

    <aside className='right-sidebar'>
         <section className="flex flex-col pb-8">
        <div className="profile-banner flex justify-end" >
        <div className="relative inline-block m-4">
      <IoMdNotificationsOutline className="w-10 h-10 text-pink-700 hover:text-pink-900 transition-colors duration-300 cursor-pointer" />
      <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 bg-red-600 rounded-full">5</span>
    </div>
        </div>
        <div className="profile">
          <div className="profile-img">
            <span className="text-5xl font-bold text-blue-500">{user.name[0]}</span>
            
          </div>

          <div className="profile-details">
            <h1 className='profile-name'>
              {user.name}
            </h1>
            <p className="profile-email">
              {user.email}
            </p>
          </div>
        </div>
      </section>
    
      <section className="banks">
        <div className="flex w-full justify-between">
          <h2 className="header-2">Update Inventory</h2>
          <Link href="/" className="flex gap-2">
            <Image 
               src="/icons/plus.svg"
              width={20}
              height={20}
              alt="plus"
            />
            <h2 className="text-14 font-semibold text-gray-600">
              Query
            </h2>
          </Link>
        </div>

        
        <div className="">
          <RecordingButtons user={user}/>
        </div>
       
      </section>

   
    </aside>

  )
}

export default RightSidebar