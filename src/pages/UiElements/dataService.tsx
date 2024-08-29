import { doc, updateDoc, collection, getDocs } from "firebase/firestore/lite";
import app from '../../database/firebaseconfig';
import { FuelStation, Teller } from "./models";
import { getFirestore } from "firebase/firestore";

const firestore = getFirestore(app);


const fuelStationsCollection = collection(firestore, "Fuel_Stations");
const tellersCollection = collection(firestore, "tellers");

export async function getFuelStations(): Promise<FuelStation[]> {
  const snapshot = await getDocs(fuelStationsCollection);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as FuelStation));
}

export async function getTellers(): Promise<Teller[]> {
  const snapshot = await getDocs(tellersCollection);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Teller));
}

export async function updateFuelStation(id: string, finalReading: number) {
  const stationRef = doc(db, "fuelStations", id);
  await updateDoc(stationRef, { finalReading });
}

export async function calculateSales(fuelStation: FuelStation): Promise<number> {
  const sales = (fuelStation.finalReading - fuelStation.initialAmount) * fuelStation.pricePerLiter;
  return sales;
}