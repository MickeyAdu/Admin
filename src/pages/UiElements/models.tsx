export interface FuelStation{
    id:String;
    name:String;
    initial:number;
    pricePerLitre:number;
    finalReading:number;
}

export interface Teller{
    id:String;
    name:String;
    assignedPumps:string[];
}