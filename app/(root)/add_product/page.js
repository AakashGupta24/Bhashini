"use client"
import React from 'react';
import AddProductFrom from '@/components/AddProductFrom';
import DataTable from '@/components/DataTable';
import { masterColumn } from '@/components/MasterColumn';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import CustomInput from '@/components/CustomInput';
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






const formSchema = z.object({
  productName: z.string(),
  price: z.coerce.number().gt(-1),
  quantity: z.coerce.number().gt(-1),
})



const PaymentTransfer = () => {
  const [master, setMaster] = useState([]);
  // const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(false)



  const [file, setFile] = useState(null);

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    setFile(selectedFile);
  };

  const handleUpload = async () => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('ID', localStorage.getItem("ID")); 
    try {
      const response = await fetch('http://localhost:5000/upload-csv', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        console.log('CSV file uploaded successfully');
        // Handle success, such as showing a success message to the user
      }
    } catch (error) {
      console.error('Error uploading CSV file:', error);
      // Handle error, such as showing an error message to the user
    }
  };


  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      productName: "",
      price: 0,
      quantity: 0,

    },
  });

  // 2. Define a submit handler.
  const onSubmit = async (userData) => {
    setIsLoading(true);
    try {
      userData.ID = localStorage.getItem("ID")
      console.log(userData);
      const response = await fetch('http://localhost:5000/add-product', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      });

      const responseData = await response.json();
      if (response.ok) {
        console.log('Product added successfully:', responseData);
        // Do something after successful product addition, like showing a success message
      } else {
        console.error('Failed to add product:', responseData);
        // Handle error case, show error message to user, etc.
      }
    } catch (error) {
      console.error('Error adding product:', error);
      // Handle error case, show error message to user, etc.
    } finally {
      setIsLoading(false);
    }
  };

  // get the master table data 
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

        {/* <AddProductFrom className="mb-4"/>
       */}
        <section className="auth-form">
          <header className='flex flex-col gap-5 md:gap-8'>


            <div className="flex flex-col gap-1 md:gap-3">
              <h1 className="text-24 lg:text-36 font-semibold text-gray-900">
                Add Product

              </h1>
            </div>
          </header>


          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">


              <CustomInput control={form.control} name='productName' label="ProductName" placeholder='Enter your productName' />

              <CustomInput control={form.control} name='price' label="Price" placeholder='Enter your Price' />
              <CustomInput control={form.control} name='quantity' label="Quantity" placeholder='Enter your Quantity' />

              <div className="flex  gap-4">
                <Button type="submit" disabled={isLoading} className="form-btn">
                  {isLoading ? (
                    <>
                      <Loader2 size={20} className="animate-spin" /> &nbsp;
                      Loading...
                    </>
                  ) : "Add Product"}
                </Button>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" className='w-28 form-btn'>ADD CSV</Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md bg-white">
                    <DialogHeader>
                      <DialogTitle>Share link</DialogTitle>
                      <DialogDescription>
                        Anyone who has this link will be able to view this.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="flex items-center space-x-2">
                      <div className="grid flex-1 gap-2">
                        {/* <Label htmlFor="link" className="sr-only">
                          Link
                        </Label> */}
                        <Input
                          id="file"
                          type='file'
                          accept=".csv" onChange={handleFileChange} 
                        />
                      </div>
                    
                    </div>
                    <DialogFooter className="sm:justify-start">
                      <DialogClose asChild>
                        <Button type="button" onClick={handleUpload} className='form-btn' variant="secondary">
                          Add
                        </Button>
                      </DialogClose>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

              </div>
            </form>
          </Form>





        </section>
        <DataTable columns={masterColumn} data={master} />
        <div className="flex flex-col gap-4 mb-5 mt-2">
          <Button type='submit' className="form-btn">
            Add to my inventory
          </Button>
        </div>
      </div>
    </div>

  );
}

export default PaymentTransfer;
