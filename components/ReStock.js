"use client"
import { useEffect, useState } from "react";
import { Payment, columns } from "./Columns";
import DataTable from "./DataTable";
const ReStockComponent = ({type,user}) => {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchUserData = async () => {

        try {
            const response = await fetch(`http://127.0.0.1:5000/product_inventory/${user}`);
            if (!response.ok) {
                throw new Error('Failed to fetch data');
            }
            const jsonData = await response.json();

            let updatedInventory = jsonData.inventory.filter(item => item.quantity < 10);
            setData(updatedInventory);
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
    <div className="container mx-auto py-10">
      <DataTable columns={columns} data={data} />
    </div>
  );
};

export default ReStockComponent;
