import app from './firebaseconfig';
import { createUserWithEmailAndPassword, getAuth ,signInWithEmailAndPassword} from "firebase/auth";
import { getFirestore, collection, getDocs ,getDoc,setDoc,doc,query,where,orderBy, deleteDoc,updateDoc} from 'firebase/firestore/lite';
import useStore from './statemanagement';
import {interval} from './datatype';
import { getStorage, ref ,uploadBytes,getDownloadURL} from "firebase/storage";

const firestore = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app)

async function getCities(interval) {
    const citiesCol = collection(firestore, 'Order_Details');
    const citySnapshot = await getDocs(citiesCol);
    const cityList = citySnapshot.docs.map(doc =>doc.data()).filter((value)=>isInInterval(value['timestamp'].seconds*1000,interval));
    // console.log(cityList)
    return cityList;
}
function isInInterval(date1,interval1){
    const currentDate = new Date(Date.now())
    const date = new Date(date1)
    const diffTime = Math.abs(currentDate - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
    // console.log(date,diffDays,interval1)
    switch(interval1){
        case interval.Daily:
            return diffDays<=1;
        case interval.Weekly:
            return diffDays<=7;
        case interval.Monthly:
            return diffDays<=30;
        case interval.Yearly:
            return diffDays<=365;
        case interval.LastYear:
            return diffDays<=730&&diffDays>=365;
    }
}
async function getFuelStation(){
    const citiesCol = collection(firestore, 'Fuel_Stations');
    const citySnapshot = await getDocs(citiesCol);
    const cityList = citySnapshot.docs.map((doc1) =>(
        getTotalOrders(doc1.data()['name']).then((data)=>{
            let totalPrice = 0
            data.forEach((value)=>{totalPrice += value['totalPrice']})
            return {name:doc1.data()['name'],totalOrders:data.length,amount:totalPrice}
        }) 
    ));
   
    return cityList;
}

async function getTotalOrders(name){
    const fuelTotal = collection(firestore, 'Order_Details');
    const fuelSnapshot = await getDocs(fuelTotal);
    let fuelList = fuelSnapshot.docs.map(
        doc => doc.data());
    fuelList = fuelList.filter((value)=>value['fuelStationName'].toLowerCase().includes(name.toLowerCase()));
    return fuelList;
}
async function totalAmount(interval){
    const citiesCol = collection(firestore, 'Order_Details');
    const citySnapshot = await getDocs(citiesCol);
    const cityList = citySnapshot.docs.map(doc => doc.data()).filter((value)=>isInInterval(value['timestamp'].seconds*1000,interval)).map((value)=>value['totalPrice']).reduce((acc,currentvalue)=>acc+currentvalue,0);
    return cityList;
}
async function totalProducts(interval){
    const citiesCol = collection(firestore, 'Order_Details');
    const citySnapshot = await getDocs(citiesCol);
    const cityList = citySnapshot.docs.map(doc =>doc.data()).filter((value)=>isInInterval(value['timestamp'].seconds*1000,interval)).length;
    console.log(cityList)
    return cityList
}

async function getTotalUsers(interval){
    const userTotal = collection(firestore, 'users');
    const userSnapshot = await getDocs(userTotal);
    const userList = userSnapshot.docs.map(
    doc => doc.data());
    
    return {totalUsers:userList.length}
}
async function fetchStationOrders(stationName){
    const value = query(collection(firestore, "Order_Details"), where("fuelStationName",'==', stationName),orderBy("timestamp","desc"));
    const ordersAsync = await getDocs(value);
    const orders = ordersAsync._docs.map((doc)=>({...doc.data(),id:doc.id}))
    
    return orders
}

async function signIn(email,password){
        const user = await signInWithEmailAndPassword(auth,email,password)
        return user.user.uid
}
async function signUp(email,password,fullname,role){
    const user = await createUserWithEmailAndPassword(auth,email,password)
    if(user){
        console.log(user)
        setDoc(doc(firestore,'users',user.user.uid),{
            email,
            first_name:fullname.trim().split(' ')[0],
            last_name:fullname.trim().split(' ')[1],
            phone: '',
            role
        }).then((value)=>{
            console.log(value)
        }).catch(()=>{
    
        })
    }
}
async function getUsername(id) {
    const ref = doc(firestore,'users',id)
        const user = (await getDoc(ref)).data();
        // console.log(user)
        return `${user['first_name']} ${user['last_name']}`
        
  };

  async function getRole(id) {
    const ref = doc(firestore,'users',id)
        const user = (await getDoc(ref)).data();
        console.log(user)
        return `${user['first_name']} ${user['last_name']}`
  };

async function deleteOrder(docId){
    const result = await deleteDoc(doc(firestore,'Order_Details',docId))
    return result
}
async function updateStock(fuelStationName,fuelType,value){
    const stockRef = query(collection(firestore,'Fuel_Stations'),where('name',"==",fuelStationName))
    const refId = (await getDocs(stockRef))._docs[0].id
    console.log(refId)
    const stock = await updateDoc(doc(firestore,'Fuel_Stations',refId),{
        [fuelType]:value
    })
    console.log(stock)
    return stock
    
}
async function totalQuantityPerStation(fuelStation,fuelType,interval){
    console.log(fuelStation,fuelType,interval)
    const citiesCol = query(collection(firestore, 'Order_Details'), where('fuelStationName', "==", fuelStation),where('fuelType','==',fuelType.toLowerCase()));
    const citySnapshot = await getDocs(citiesCol);
    const cityList = citySnapshot._docs.map(doc => doc.data()).filter((value)=>isInInterval(value['timestamp'].seconds*1000,interval)).map((value)=>value['quantity']).reduce((acc,currentvalue)=>acc+parseFloat(currentvalue),0);
    console.log(cityList)
    return cityList;
}
async function totalAmountPerStation(fuelStation,fuelType,interval){
    console.log(fuelStation,fuelType,interval)
    const citiesCol = query(collection(firestore, 'Order_Details'), where('fuelStationName', "==", fuelStation),where('fuelType','==',fuelType.toLowerCase()));
    const citySnapshot = await getDocs(citiesCol);
    const cityListTA = citySnapshot._docs.map(doc => doc.data()).filter((value)=>isInInterval(value['timestamp'].seconds*1000,interval)).map((value)=>value['totalPrice']).reduce((acc,currentvalue)=>acc+parseFloat(currentvalue),0);
    console.log(cityListTA)
    return cityListTA;
}
async function totalProcessedFuelPerStation(fuelStation,fuelType,interval){
    console.log(fuelStation,fuelType,interval)
    const citiesCol = query(collection(firestore, 'Order_Details'), where('fuelStationName', "==", fuelStation),where('fuelType','==',fuelType.toLowerCase()),wher('trans_process_state','==','accepted'));
    const citySnapshot = await getDocs(citiesCol);
    const cityListTA = citySnapshot._docs.map(doc => doc.data()).filter((value)=>isInInterval(value['timestamp'].seconds*1000,interval)).map((value)=>value['trans_process_state']).reduce((acc,currentvalue)=>acc+parseFloat(currentvalue),0);
    console.log(cityListTA)
    return cityListTA;
}

async function uploadFile(image,id){
    console.log(id)
    const storageRef = ref(storage,`image/${id}`)
    uploadBytes(storageRef,image).then((value)=>{
        console.log(value)
        getDownloadURL(storageRef).then((url)=>{
            updateDoc(doc(firestore,'users',id),{
                profileImage:url
            }).catch(err=>{
                console.log(err)
            })
        })
    }).catch(err=>{
        console.log(err)
    })
}
async function getUser(id){
    const docRef = doc(firestore,"users",id)
    const result = await getDoc(docRef)
    if(result.exists()){
        return result.data()
    }
}

export {
    getCities,
    getFuelStation,
    signIn,
    signUp,
    getTotalUsers,
    totalAmount,
    totalProducts,
    fetchStationOrders,
    deleteOrder,
    getUsername,
    getRole,
    updateStock,
    totalQuantityPerStation,
    totalAmountPerStation,
    totalProcessedFuelPerStation,
    uploadFile,
    getUser
}

