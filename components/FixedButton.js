"use client"
import React, { useState } from 'react';
import Image from 'next/image';

const RecordingButtons = ({user}) => {
  const [showAddButton, setShowAddButton] = useState(true);
  const [showMinusButton, setShowMinusButton] = useState(true);
  const [showRecordingButtons, setShowRecordingButtons] = useState(false);
  const [event, setEvent] = useState('')
  // console.log(user._id);
  const handleAddClick = () => {
    setShowAddButton(false);
    setShowMinusButton(false);
    setShowRecordingButtons(true);
    setEvent("add")
    
  };

  const handleMinusClick = () => {
    setShowMinusButton(false);
    setShowAddButton(false);
    setShowRecordingButtons(true);
    setEvent("delete")
  };

  const handleRecordingStart = () => {
    // Make fetch call to /start_recording
    console.log('Started recording');
    async function fetchData() {
        try {
            const response = await fetch('http://127.0.0.1:5000/start_recording');
            if (!response.ok) {
                throw new Error('Failed to fetch data');
            }
            const jsonData = await response.json();
            console.log(jsonData);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    }
    fetchData();
  };

  const handleRecordingStop = async () => {
    console.log('Stopped recording');

    async function fetchData() {
        try {
            const response = await fetch('http://127.0.0.1:5000/stop_recording');
            if (!response.ok) {
                throw new Error('Failed to fetch data');
            }
            const jsonData = await response.json();
            console.log(jsonData);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    }

    async function execute_p_file(user_id) {
        try {
            const response = await fetch('http://127.0.0.1:5000/execute-python-file', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ user_id: user._id }),
            });

            if (!response.ok) {
                throw new Error('Failed to fetch data');
            }

            const jsonData = await response.json();
            console.log(jsonData);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    }
    async function execute_delete() {
      // console.log(user._id);
        try {
            const response = await fetch('http://127.0.0.1:5000/delete_python');

            if (!response.ok) {
                throw new Error('Failed to fetch data');
            }

            const jsonData = await response.json();
            console.log(jsonData);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    }

    await fetchData();
    if (event === 'add') {
      
      await execute_p_file(user._id);
    }
    if (event === 'delete') {
      console.log("hello from dlelete");
      await execute_delete();
    }

    setShowAddButton(true);
    setShowMinusButton(true);
    setShowRecordingButtons(false);
};



  return (
    <div className="recording-buttons">
      {showAddButton && (
        <button className="add-button" onClick={handleAddClick}>
          <Image src="/icons/plus.png" width={80} height={80} alt="Add" />
        </button>
      )}
      {showMinusButton && (
        <button className="minus-button" onClick={handleMinusClick}>
          <Image src="/icons/minus.png" width={80} height={80} alt="Minus" />
        </button>
      )}
      {showRecordingButtons && (
       <div className='flex flex-col gap-4 w-full'>
       <button
         className="start-recording-button bg-blue-500 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-full mr-4 ml-5"
         onClick={handleRecordingStart}
       >
         Start Recording
       </button>
       <button
         className="stop-recording-button bg-red-500 hover:bg-red-700 text-white font-bold py-4 px-8 rounded-full mr-4 ml-5"
         onClick={handleRecordingStop}
       >
         Stop Recording
       </button>
     </div>
     
      )}
    </div>
  );
};

export default RecordingButtons;
