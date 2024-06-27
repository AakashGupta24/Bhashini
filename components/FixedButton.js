"use client"
import React, { useState } from 'react';
import Image from 'next/image';
import { CopyIcon } from "@radix-ui/react-icons"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"


const RecordingButtons = ({ user }) => {
  const [showAddButton, setShowAddButton] = useState(true);
  const [showMinusButton, setShowMinusButton] = useState(true);
  const [showRecordingButtons, setShowRecordingButtons] = useState(false);
  const [event, setEvent] = useState('')


  const { register, handleSubmit, formState: { errors } } = useForm();
  const [uploadedFile, setUploadedFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState("")

  const onSubmit = async (data) => {
    const formData = new FormData();
    formData.append('file', data.file[0]);
    console.log(formData);
    try {
      const res = await fetch('http://localhost:5000/image', {
        method: 'POST',
        body: formData,
      });

      const responseData = await res.json();

      if (res.ok) {
        setUploadStatus('File uploaded successfully: ' + JSON.stringify(responseData));
      } else {
        setUploadStatus('File upload failed: ' + JSON.stringify(responseData));
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      setUploadStatus('Error uploading file');
    }
  }
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
      <div className="gap-4 flex mt-4">
        {showAddButton && (
          <>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  
            <button className="add-button" onClick={handleAddClick}>
              <Image src="/icons/add.jpg" width={80} height={80} alt="Add" />
            </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Add in Inventory</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </>
        )}
        {showMinusButton && (
          <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
            <button className="minus-button" onClick={handleMinusClick}>
            <Image src="/icons/delet.jpg" width={80} height={80} alt="Minus" />
          </button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Remove</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
          
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


      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline" className="bg-blue-700 text-white m-4 rounded-xl" onClick={() => setUploadStatus("")}>
            Upload Image
          </Button>

        </DialogTrigger>
        <DialogContent className="sm:max-w-md bg-white">
          <DialogHeader>
            <DialogDescription>
              {/* Anyone who has this link will be able to view this. */}
            </DialogDescription>
          </DialogHeader>
          <div className=" flex items-center justify-center ">
            <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-4 rounded-lg shadow-md w-80">
              <h2 className="text-xl font-bold mb-3 text-center">Upload Image</h2>
              <div className="mb-3">
                <input
                  type="file"
                  {...register('file', { required: 'Please select a file' })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {errors.file && <p className="text-red-500 mt-1 text-sm">{errors.file.message}</p>}
              </div>
              <button
                type="submit"
                className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition duration-200"
              >
                Upload
              </button>
              {uploadStatus && <p className="mt-3 text-center text-sm">{uploadStatus}</p>}
            </form>
          </div>
        </DialogContent>
      </Dialog>



    </div>
  );
};

export default RecordingButtons;
