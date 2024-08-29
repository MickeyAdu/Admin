const interval = Object.freeze({
    Daily:1,
    Weekly:2,
    Monthly:3,
    Yearly:4,
    LastYear:5,
});
const fuelStation = Object.freeze({
    totalFS:'Total Fuel Station',
    shellFS:'Shell Fuel Station',
    goilFS: 'Goil Fuel Station',
    petrosolFS:'Petrosol Fuel Station'
})
const fuelType = Object.freeze({
    gas:'Gas',
    petrol:'Petrol',
    diesel:'Diesel',

})
export {
    interval,
    fuelStation,
    fuelType
}