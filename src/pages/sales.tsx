import React, { useState, useEffect } from 'react';
import { getFirestore, collection, addDoc, getDocs } from 'firebase/firestore/lite';
import { useNavigate } from 'react-router-dom';
import app from '../database/firebaseconfig';
import useStore from '../database/statemanagement';
import {fuelType,fuelStation,interval} from '../database/datatype';
import {updateStock,totalQuantityPerStation,totalAmountPerStation,totalProcessedFuelPerStation} from '../database/db'
import Breadcrumb from '../components/Breadcrumbs/Breadcrumb';
import FuelBox from './UiElements/fuel_box';
import Modal from 'react-modal';

const firestore = getFirestore(app);

const Sales: React.FC = () => {
  const id = useStore((state: any) => state.id);
  const navigate = useNavigate();

  useEffect(() => {
    if (!id) {
      navigate('/auth/signin');
    }
  }, [id, navigate]);

  const [initialReadings, setInitialReadings] = useState<{ pumpId: string, reading: number, date: string, tellerId: string }[]>([]);
  const [finalReadings, setFinalReadings] = useState<{ pumpId: string, reading: number, date: string, tellerId: string, departureTime: string }[]>([]);
  const [pricePerLitre, setPricePerLitre] = useState<number>(1.5);
  const [salesData, setSalesData] = useState<Array<{ pumpId: string, totalSalesLitres: number, departureTime: string, amount: number }>>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFuelType, setSelectedFuelType] = useState<string>('');
  const [additionalAmount, setAdditionalAmount] = useState<number>(0);
  const [quantity,setQuantity] = useState(null)
  const [totalAmount,setTotalAmount] = useState(null);
  const [totalProcessed,setTotalProcessed] = useState(null);



  const [selectFuelStation,setSelectedFuelStation] = useState(fuelStation.totalFS);
  const [chosenFuelStation,setChosenFuelStation] = useState(fuelStation.goilFS);
  const [chosenFuelType, setchosenFuelType] = useState(fuelType.gas)


  useEffect(() => {
    const fetchData = async () => {
      try {
        const initialReadingsCollection = collection(firestore, 'initialReadings');
        const initialSnapshot = await getDocs(initialReadingsCollection);
        const initialData = initialSnapshot.docs.map(doc => ({ pumpId: doc.id, ...doc.data() } as { pumpId: string, reading: number, date: string, tellerId: string }));
        setInitialReadings(initialData);

        const finalReadingsCollection = collection(firestore, 'finalReadings');
        const finalSnapshot = await getDocs(finalReadingsCollection);
        const finalData = finalSnapshot.docs.map(doc => ({ pumpId: doc.id, ...doc.data() } as { pumpId: string, reading: number, date: string, tellerId: string, departureTime: string }));
        setFinalReadings(finalData);
      } catch (error) {
        console.error("Error fetching data: ", error);
      }
    };

    fetchData();
  }, []);

  const calculateTotalSales = () => {
    //pass the total quantity of a particular chosen station and fuel
    totalQuantityPerStation(chosenFuelStation,chosenFuelType,interval.Yearly).then((value)=>{
      setQuantity(value)
    })

    totalAmountPerStation(chosenFuelStation,chosenFuelType,interval.Yearly).then((value)=>{
      setTotalAmount(value)
    })
    totalProcessedFuelPerStation(chosenFuelStation,chosenFuelType,interval.Yearly).then((value)=>{
      setTotalProcessed(value)
    })

    const data = initialReadings.map(initial => {
      const final = finalReadings.find(f => f.pumpId === initial.pumpId);
      if (final) {
        const totalSalesLitres = final.reading - initial.reading;
        const amount = totalSalesLitres * pricePerLitre;
        return { pumpId: initial.pumpId, totalSalesLitres, departureTime: final.departureTime, amount };
      }
      return { pumpId: initial.pumpId, totalSalesLitres: 0, departureTime: '', amount: 0 };
    });
    setSalesData(data);
  };

  const openModal = (fuelType: string) => {
    setSelectedFuelType(fuelType);
    
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };
  function selectFuelStationChange(e){
    setSelectedFuelStation(e.target.value)
  }
  function chooseFuelStationChange(e){
    setChosenFuelStation(e.target.value)

  }
  function chooseFuelTypeChange(e){
    setchosenFuelType(e.target.value)

  }
  const handleSubmit = async () => {
    try {
      const newStockData: any = {
        timestamp: new Date(),
      };
      if(additionalAmount){
        updateStock(selectFuelStation,selectedFuelType,additionalAmount)
      }
      
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error updating stock: ", error);
    }
  };

  return (
    <>
      <Breadcrumb pageName="Sales" />
      <div className="Sales p-4">
        <div className='grid justify-center mb-10'>
          <span className='mb-6 flex justify-center text-4xl font-semibold text-black dark:text-white uppercase '>
            Stock
          </span>  
          <div className="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
          <div className='max-w-full overflow-x-auto'>
            <div className="w-full table-auto">
              <div>
                <select name="fuelname" id="fuel" className=' grid items-start text-2xl font-bold outline-none rounded-sm bg-transparent text-white' onChange={selectFuelStationChange}>
                  <option value={fuelStation.totalFS} className='text-black' selected={true}>Total Fuel Station </option>
                  <option value={fuelStation.shellFS} className='text-black'>Shell Fuel Station </option>
                  <option value={fuelStation.PetrosolFS} className='text-black'>Petrosol Fuel Station </option>
                  <option value={fuelStation.goilFS} className='text-black'>Goil Fuel Station </option>
                </select>
              </div>
              
              <div className='flex'>
                <div className="border-b border-[#eee] py-5 px-4 dark:border-strokedark cursor-pointer" onClick={() => openModal(fuelType.petrol)}>
                  <FuelBox color="blue" />
                  <p className="text-black text-xl font-normal dark:text-white">Petrol</p>
                </div>
                <div className="border-b border-[#eee] py-5 px-4 dark:border-strokedark cursor-pointer" onClick={() => openModal(fuelType.gas)}>
                  <FuelBox color="red" />
                  <p className="text-black text-xl font-normal dark:text-white">Gasoline</p>
                </div>
                <div className="border-b border-[#eee] py-5 px-4 dark:border-strokedark cursor-pointer" onClick={() => openModal(fuelType.diesel)}>
                  <FuelBox color="yellow" />
                  <p className="text-black text-xl font-normal dark:text-white">Diesel</p>
                </div>
              </div>
            </div>
          </div>
          </div>    
        </div>
        
        <div className="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
  <div className="max-w-full overflow-x-auto">
    <div className="w-full table-auto">
      <div className="flex">
        <div className="mr-4">
          <select
            name="some"
            id="some"
            className="grid items-start text-xl font-bold outline-none rounded-sm bg-transparent dark:text-white text-black"
            onChange={chooseFuelStationChange}
          >
            <option value={fuelStation.totalFS} className="text-black dark:text-white">
              Total Fuel Station
            </option>
            <option value={fuelStation.shellFS} className="text-black dark:text-white">
              Shell Fuel Station
            </option>
            <option value={fuelStation.PetrosolFS} className="text-black dark:text-white">
              Petrosol Fuel Station
            </option>
            <option value={fuelStation.goilFS} className="text-black dark:text-white" selected={true}>
              Goil Fuel Station
            </option>
          </select>
        </div>
        <div>
          <select
            name="some"
            id="some"
            className="grid items-start text-xl font-bold outline-none rounded-sm bg-transparent dark:text-white text-black"
            onChange={chooseFuelTypeChange}
          >
            <option value={fuelType.gas} className="text-black dark:text-white" selected={true}>
              Gasoline
            </option>
            <option value={fuelType.diesel} className="text-black dark:text-white">
              Diesel
            </option>
            <option value={fuelType.petrol} className="text-black dark:text-white">
              Petrol
            </option>
          </select>
        </div>
        <div>
          <select
            name="some"
            id="some"
            className="grid items-start text-xl font-normal outline-none rounded-sm bg-transparent dark:text-white text-black"
            onChange={chooseFuelTypeChange}
          >
            <option value={fuelType.gas} className="text-black dark:text-white" selected={true}>
              Teller 1
            </option>
            <option value={fuelType.diesel} className="text-black dark:text-white">
              Teller 2
            </option>
            <option value={fuelType.petrol} className="text-black dark:text-white">
              Teller 3
            </option>
          </select>
        </div>
      </div>

      <button
        className="mt-4 bg-blue-900 text-white font-bold py-2 px-4 rounded"
        onClick={calculateTotalSales}
      >
        Show Sales
      </button>
      {salesData.length > 0 && (
        <table className="min-w-full mt-4 mb-3 bg-white dark:bg-gray-800">
          <thead>
            <tr>
              <th className="border px-4 py-2 dark:text-white text-black text-2xl font-bold">Teller ID</th>
              <th className="border px-4 py-2 dark:text-white text-black text-2xl font-bold">Total Sales/Litres</th>
              <th className="border px-4 py-2 dark:text-white text-black text-2xl font-bold">Amount</th>
            </tr>
          </thead>
          <tbody>
            {salesData.map((data, index) => (
              <tr key={index}>
                <td className="border px-4 py-2 dark:text-white text-black text-lg font-normal">{data.pumpId}</td>
                <td className="border px-4 py-2 dark:text-white text-black text-lg font-normal">{quantity}</td>
                <td className="border px-4 py-2 dark:text-white text-black text-lg font-normal">
                  {new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'GHS' }).format(totalAmount)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  </div>
</div>


      </div>

      <Modal
        isOpen={isModalOpen}
        onRequestClose={closeModal}
        contentLabel="Input Additional Amount"
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-5 rounded-lg outline-none"
        overlayClassName="fixed top-0 left-0 right-0 bottom-0 bg-black bg-opacity-75 z-50"
      >
        <h2 className="text-2xl mb-4 text-blue-950">Update Stock for {selectedFuelType}</h2>
        <input
        placeholder='delivered amount'
          type="number"
          onChange={(e) => setAdditionalAmount(parseFloat(e.target.value))}
          className="mt-2 p-2 border rounded w-full"
        />
         
        <div className="mt-4 flex justify-end">
          <button 
            onClick={handleSubmit}
            className="bg-blue-900 text-white font-bold py-2 px-4 rounded mr-2"
          >
            Submit
          </button>
          <button 
            onClick={closeModal}
            className="bg-red-500 text-white font-bold py-2 px-4 rounded"
          >
            Cancel
          </button>
        </div>
      </Modal>
    </>
  );
};

export default Sales;
