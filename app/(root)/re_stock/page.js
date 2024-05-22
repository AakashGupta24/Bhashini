"use client";
import React, { useEffect, useState } from 'react';
import ReStockComponent from '@/components/ReStock';
import getUserInfo from '@/lib/actions/user.actions';
import { EnvelopeOpenIcon } from "@radix-ui/react-icons"
 
import { Button } from "@/components/ui/button"
 
const ReStock = () => {
  const [loggedIn, setLoggedIn] = useState(null);
  const [loading, setLoading] = useState(true);
  const [emailSend, setEmailSend] = useState('')

  useEffect(() => {
    const fetchUserData = async () => {
      if (!loggedIn) {
        const userInfo = await getUserInfo();
        setLoggedIn(userInfo);
        setLoading(false);
      }
    };
    fetchUserData();
  }, [loggedIn]);

  const mobileMessage = async () => {
    try {
      const response = await fetch(`http://127.0.0.1:5000/mobilemessage/${loggedIn._id}`, {
        method: 'GET', // Adjust the method if needed (GET, POST, etc.)
      });

      if (!response.ok) {
        setEmailSend('Email not send')
        throw new Error('Network response was not ok');

      }

      const data = await response.json();
      setEmailSend('Email and Sms Send to Your Mobile')
      console.log(data.message);
      // Handle the response data as needed
    } catch (error) {
      console.error('There was a problem with the fetch operation:', error);
    }
  };

  if (loading) {
    return <div>Loading...</div>; // or a loading indicator
  }

  return (
    <div className="header-box flex flex-col items-start pt-8">
      <h1 className="text-4xl font-bold mb-4 pl-12 text-bankGradient">Re-Stock</h1>
      <Button className='pl-12 ml-10 px-4 py-2 bg-blue-500 text-white rounded-lg flex items-center hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300'
      onClick={mobileMessage}>
      <EnvelopeOpenIcon className="mr-2 h-4 w-4" /> Send Email
    </Button>
    {
      emailSend && (
        <div className="pl-12 text-blue-500 font-semibold">{emailSend}</div>
      )
    }
      <ReStockComponent type="re-stock" user={loggedIn._id} />
     
    </div>
  );
};

export default ReStock;
