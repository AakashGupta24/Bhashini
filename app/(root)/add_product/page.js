"use client"
import React from 'react';
import AddProductFrom from '@/components/AddProductFrom';
import DataTable from '@/components/DataTable';
import { masterColumn } from '@/components/MasterColumn';
import { useState,useEffect } from 'react';
import getUserInfo from '@/lib/actions/user.actions';
import { Button } from '@/components/ui/button';


const addInventory = () =>{
  
}



const PaymentTransfer = () => {
  const [master, setMaster] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const getMasterTable = async () => {
      console.log('inside master');
      try {
        const response = await fetch(`http://127.0.0.1:5000/getmastertable`, {
          method: 'GET', // Adjust the method if needed (GET, POST, etc.)
        });
  
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
  
        const data = await response.json();
        setMaster(data);
        console.log(data); // Log the received data, not the state
      } catch (error) {
        console.error('There was a problem with the fetch operation:', error);
      }
    };
  
    getMasterTable();
  
    const intervalId = setInterval(getMasterTable, 60000);
  
    return () => {
      clearInterval(intervalId);
    };
  }, []);
  
  

  // if (loading) {
  //   return <div>Loading...</div>; // or a loading indicator
  // }
  return (
    <div className="flex justify-center ">
    <div className="w-full max-w-xl">
      <AddProductFrom className="mb-4"/>
      <DataTable columns={masterColumn} data={master}/>
      <div className="flex flex-col gap-4 mb-5 mt-2">
                        <Button onClick={addInventory} className="form-btn">
                            Add to my inventory
                        </Button>
                    </div>
    </div>
  </div>

  );
}

export default PaymentTransfer;
