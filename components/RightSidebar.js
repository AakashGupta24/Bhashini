"use client"
import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import RecordingButtons from './FixedButton'
import { IoMdNotificationsOutline } from "react-icons/io";

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
 import { useState,useEffect } from 'react'
import Notify from './Notify'
const RightSidebar = ({user,transactions,banks}) => {

const [notifyNumber, setNotifyNumber] = useState(null)







useEffect(() => {
  const fetchUserData = async () => {

      try {
          const response = await fetch(`http://127.0.0.1:5000/product_inventory/${user._id}`);
          if (!response.ok) {
              throw new Error('Failed to fetch data');
          }
          const jsonData = await response.json();

          let updatedInventory = jsonData.inventory.filter(item => item.quantity > 0 && item.quantity < 10);

          console.log(updatedInventory);
          if (updatedInventory.length == 0) {
            setNotifyNumber(null)
          }
          else{

            setNotifyNumber(updatedInventory.length);
          }
      } catch (error) {
          console.error('Error fetching data:', error);
      }
  };

  fetchUserData();


  // Setup polling to fetch data at regular intervals
  const intervalId = setInterval(fetchUserData, 60000); // Fetch data every minute (adjust as needed)

  // Cleanup function to clear the interval when the component unmounts
  return () => clearInterval(intervalId);
}, []);

  return (

    <aside className='right-sidebar'>
         <section className="flex flex-col pb-8">
        <div className="profile-banner flex justify-end" >
        <div className="relative inline-block m-4">

        <Sheet className='bg-white'>
      <SheetTrigger asChild>
        <Button variant="outline">

        <IoMdNotificationsOutline className="w-10 h-10 text-pink-700 hover:text-pink-900 transition-colors duration-300 cursor-pointer" />
      {
        notifyNumber && (

          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 bg-red-600 rounded-full">
      {notifyNumber}
      </span>
        )
      }
        
    
        
        </Button>
      </SheetTrigger>
      <SheetContent className='bg-white'>
        <SheetHeader>
          <SheetTitle>Notifications</SheetTitle>
        </SheetHeader>
        {
          notifyNumber && (

            <Notify heading={'Restock Inventory'} subtext={'Add these itmes in the inventory'} link={'/re_stock'}/>
          )
        }
        <SheetFooter>
          <SheetClose asChild>
            {/* <Button >Save changes</Button> */}
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>


          
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