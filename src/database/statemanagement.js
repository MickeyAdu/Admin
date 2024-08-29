import {create} from 'zustand'
import {interval} from './datatype'
import {persist} from "zustand/middleware";
const useStore = create(persist(
    set=>({
        totalUsers:0,
        fuelStationDetail:[],
        amountTotal:0,
        interval:interval.Yearly,
        productTotal:0,
        user:{},
        id:null,
        setUser:(user)=>set(state=>({user:user})),
        setID:(id)=>set(state=>{
            return {id:id}
        }),
        setFuelStationDetail:(detail)=>set({fuelStationDetail:detail}),
        setTotalUsers:(total)=>set({totalUsers:total}),
        setAmountTotal:(amount)=>set({amountTotal:amount}),
        setTotalProduct:(sum)=>set({productTotal:sum}),
        setInterval:(sum)=>set({interval:sum}),
        setUsername:(dataa)=>set({username:dataa}),
        setProfile:(image)=>set(state=>({
            user:{...state.user,profileImage:image}
        }))
    }),
    {
        name:'store',
        getStorage:()=> sessionStorage
    }
));


export default useStore