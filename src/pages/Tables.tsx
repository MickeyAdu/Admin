import Breadcrumb from '../components/Breadcrumbs/Breadcrumb';

import TableOne from '../components/Tables/TableOne';
import TableTwo from '../components/Tables/TableTwo';
import useStore from '../database/statemanagement';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {fuelStation} from '../database/datatype'
const Tables: React.FC  = () => {
  const id = useStore((state:any)=>state.id)
  const navigate = useNavigate()
  useEffect(()=>{
    console.log(fuelStation.totalFS)
    if(!id){
      navigate('/auth/signin')
    }
  },[])
  return (
    <>
      <Breadcrumb pageName="Tables" />

      <div className="flex flex-col gap-10">
        <TableOne />
        <TableTwo fuelStation={fuelStation.totalFS}/>
        <TableTwo fuelStation={fuelStation.shellFS}/>
        <TableTwo fuelStation={fuelStation.goilFS}/>
        <TableTwo fuelStation={fuelStation.petrosolFS}/>
      </div>
    </>
  );
};

export default Tables;
