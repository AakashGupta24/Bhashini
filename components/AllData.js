"use client"
import { useEffect, useState } from "react";
import { Payment, columns } from "./Columns";
import DataTable from "./DataTable";

const AllData = ({ type ,user }) => {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`http://127.0.0.1:5000/product_inventory/${user}`);
        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }
        const jsonData = await response.json();

        setData(jsonData.inventory);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();

    const intervalId = setInterval(fetchData, 60000); // Fetch data every minute (adjust as needed)

    // Cleanup function to clear the interval when the component unmounts
    // return () => clearInterval(intervalId);
  }, []); // Empty dependency array to run the effect only once, when the component mounts

  return (
    <div className="container mx-auto py-10">
      <DataTable columns={columns} data={data} />
    </div>
  );
};

export default AllData;
