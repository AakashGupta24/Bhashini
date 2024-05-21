"use client"
import React from 'react';
import ReStockComponent from '@/components/ReStock';
import { useEffect,useState } from 'react';
import getUserInfo from '@/lib/actions/user.actions';
const ReStock =() => {
  const [loggedIn, setLoggedIn] = useState(null);
  const [loading, setLoading] = useState(true)
   useEffect(() => {
    const fetchUserData = async () => {
      if (!loggedIn) {
        
        const userInfo = await getUserInfo();
        setLoggedIn(userInfo);
        setLoading(false)
      }
    };
    fetchUserData();

}, []);
if (loading) {
  return <div>Loading...</div>; // or a loading indicator
}
  return (
    <div className="header-box flex flex-col items-start pt-8 ">
      <h1 className="text-4xl font-bold mb-4 pl-12 text-bankGradient">Re-Stock</h1>
      <ReStockComponent type='re-stock' user={loggedIn._id}/>
    </div>
  );
}

export default ReStock;
