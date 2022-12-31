import { api, track, wire } from 'lwc';
import LightningModal from 'lightning/modal';
import getPropertyGeo from '@salesforce/apex/getProperties.getPropertyGeo';
import getPlaces from '@salesforce/apex/FindPlaces.getPlaces';

const TYPE_LIMIT = 3;

export default class ModalMapMain extends LightningModal {
    @api content;
    mapMarkers = [];
    zoomLevel = 14;
    listView = 'hidden';
    center;
    selectedMarkerValue;
    mapUrl;
    anyMarkerSelected = false;

    // Stores each type of search result in array
    @track hotels = [];
    @track restaurants = [];
    @track airports = [];
    @track schools = [];
    @track gyms = [];
    @track banks = [];
    @track hospitals = [];
    @track supermarkets = [];
    @track properties = [];
    @track property;
    @track error;

    // Checking if types are selected for search results, or disabled when type limit reached
    hotelSelected = false;
    restaurantSelected = false;
    airportSelected = false;
    schoolSelected = false;
    gymSelected = false;
    bankSelected = false;
    hospitalSelected = false;
    supermarketSelected = false;
    hotelDisabled = false;
    restaurantDisabled = false;
    airportDisabled = false;
    schoolDisabled = false;
    gymDisabled = false;
    bankDisabled = false;
    hospitalDisabled = false;
    supermarketDisabled = false;
    noneSelected = true;

    // Checking if a type has already been searched, to prevent repeat API calls
    hotelSearched = false;
    restaurantSearched = false;
    airportSearched = false;
    schoolSearched = false;
    gymSearched = false;
    bankSearched = false;
    hospitalSearched = false;
    supermarketSearched = false;
    searchedNum = 0;

    // Property ID & geolocation, and array of types for API to loop over
    @api propertyId;
    lat;
    lon;
    types = [];

    @api
    get recordId() {
        return this.propertyId;
    }

    set recordId(propertyId) {
        this.propertyId = propertyId;
    }

    @wire (getPropertyGeo, {propId: "$propertyId"}) getPropertyGeo(result) {
        if (result.data) {
            console.log("ID", this.propertyId, this.recordId);
            this.properties = result.data;
            this.property = this.properties[0];
            console.log("PROP GEO", this.property.Geolocation__Latitude__s, this.property.Geolocation__Longitude__s);
            this.lat = this.property.Geolocation__Latitude__s;
            this.lon = this.property.Geolocation__Longitude__s;
            this.center = {
                location: {
                    Latitude: this.lat,
                    Longitude: this.lon
                }
            };
            this.populatePropertyMarker();
            this.error = undefined;
        } else if (result.error) {
            console.log("ID", this.propertyId, this.recordId);
            this.error = result.error;
            console.log("ERROR", this.error);
            this.properties = [];
            this.property = null;
        }
    }

    // Link to view selected property or location on Google Maps
    handleLink() {
        // console.log(this.selectedMarkerValue);
        window.open(this.selectedMarkerValue);
    }

    // Reset search parameters
    handleReset() {
        this.types = [];
        this.noneSelected = true;
        this.hotelSelected = false;
        this.restaurantSelected = false;
        this.airportSelected = false;
        this.schoolSelected = false;
        this.gymSelected = false;
        this.bankSelected = false;
        this.hospitalSelected = false;
        this.supermarketSelected = false;
        this.hotelDisabled = false;
        this.restaurantDisabled = false;
        this.airportDisabled = false;
        this.schoolDisabled = false;
        this.gymDisabled = false;
        this.bankDisabled = false;
        this.hospitalDisabled = false;
        this.supermarketDisabled = false;
    }

    // Apex method to get places given property geocode and a type of result, using Google Maps Places API
    getNearbyPlaces() {

        for (let i = 0; i < this.types.length; i++) {
            getPlaces({ type: this.types[i], lat: this.lat, lon: this.lon})
            .then((result) => {
                // Populate arrays of results based on types inputted in search results
                if (this.types[i] == 'lodging' && !this.hotelSearched) {
                    this.hotels = result;
                    this.hotelSearched = true;
                } else if (this.types[i] == 'restaurant' && !this.restaurantSearched) {
                    this.restaurants = result;
                    this.restaurantSearched = true;
                } else if (this.types[i] == 'airport' && !this.airportSearched) {
                    this.airports = result;
                    this.airportSearched = true;
                } else if (this.types[i] == 'school' && !this.schoolSearched) {
                    this.schools = result;
                    this.schoolSearched = true;
                } else if (this.types[i] == 'gym' && !this.gymSearched) {
                    this.gyms = result;
                    this.gymSearched = true;
                } else if (this.types[i] == 'bank' && !this.bankSearched) {
                    this.banks = result;
                    this.bankSearched = true;
                } else if (this.types[i] == 'hospital' && !this.hospitalSearched) {
                    this.hospitals = result;
                    this.hospitalSearched = true;
                } else if (this.types[i] == 'supermarket' && !this.supermarketSearched) {
                    this.supermarkets = result;
                    this.supermarketSearched = true;
                }

                // Update search counter to keep track of search results, also accounting for those already searched
                this.searchedNum = 0;
                if (this.hotelSearched && this.hotelSelected) this.searchedNum++;
                if (this.restaurantSearched && this.restaurantSelected) this.searchedNum++;
                if (this.airportSearched && this.airportSelected) this.searchedNum++;
                if (this.schoolSearched && this.schoolSelected) this.searchedNum++;
                if (this.gymSearched && this.gymSelected) this.searchedNum++;
                if (this.bankSearched && this.bankSelected) this.searchedNum++;
                if (this.hospitalSearched && this.hospitalSelected) this.searchedNum++;
                if (this.supermarketSearched && this.supermarketSelected) this.searchedNum++;

                // Populate markers when all types searched
                console.log(this.searchedNum, this.types.length);
                if (this.searchedNum == this.types.length) {
                    this.populateMarkers();
                }
                this.error = undefined;
            })
            .catch((error) => {
                this.error = error;
                console.log(error.message);
                
                this.hotels = undefined;
                this.restaurants = undefined;
                this.airports = undefined;
                this.schools = undefined;
                this.gyms = undefined;
                this.banks = undefined;
                this.hospitals = undefined;
                this.supermarkets = undefined;
            });
        }
    }

    // Selecting types of locations to search for, adding to array of types which API will loop over
    handleTypeSelect(event) {
        // console.log(event.target.value);
        if (this.types && this.types.includes(event.target.value)) {
            const index = this.types.indexOf(event.target.value);
            if (index > -1) {
                this.types.splice(index, 1);
            }
        } else if (!this.types || this.types.length < TYPE_LIMIT) {
            this.types.push(event.target.value);
        }
        
        this.updateSelected();

        console.log(this.types.length, this.types[0], this.types[1], this.types[2]);
    }

    // Update button status for types of search results
    updateSelected() {
        // Checks if button is selected
        this.hotelSelected = this.types.includes('lodging') ? true : false;
        this.restaurantSelected = this.types.includes('restaurant') ? true : false;
        this.airportSelected = this.types.includes('airport') ? true : false;
        this.schoolSelected = this.types.includes('school') ? true : false;
        this.gymSelected = this.types.includes('gym') ? true : false;
        this.bankSelected = this.types.includes('bank') ? true : false;
        this.hospitalSelected = this.types.includes('hospital') ? true : false;
        this.supermarketSelected = this.types.includes('supermarket') ? true : false;

        if (this.types.length == TYPE_LIMIT) {
            // If type limit reached, disable unselected buttons
            this.hotelDisabled = this.hotelSelected ? false : true;
            this.restaurantDisabled = this.restaurantSelected ? false : true;
            this.airportDisabled = this.airportSelected ? false : true;
            this.schoolDisabled = this.schoolSelected ? false : true;
            this.gymDisabled = this.gymSelected ? false : true;
            this.bankDisabled = this.bankSelected ? false : true;
            this.hospitalDisabled = this.hospitalSelected ? false : true;
            this.supermarketDisabled = this.supermarketSelected ? false : true;
        } else if (this.types.length < TYPE_LIMIT) {
            // If below type limit, automatically enable all buttons
            this.hotelDisabled = false;
            this.restaurantDisabled = false;
            this.airportDisabled = false;
            this.schoolDisabled = false;
            this.gymDisabled = false;
            this.bankDisabled = false;
            this.hospitalDisabled = false;
            this.supermarketDisabled = false;
        }

        if (!this.types || this.types.length == 0) {
            this.noneSelected = true;
        } else {
            this.noneSelected = false;
        }
    }
    
    // Populate just the property's marker
    populatePropertyMarker() {
        this.mapMarkers = [];

        this.mapUrl = "https://maps.google.com/";
        this.mapUrl = this.mapUrl.concat("?ll=");
        this.mapUrl = this.mapUrl.concat(this.lat.toString());
        this.mapUrl = this.mapUrl.concat(",");
        this.mapUrl = this.mapUrl.concat(this.lon.toString());

        // Marker for the property in question
        this.mapMarkers.push({
            location: {
                Latitude: this.lat,
                Longitude: this.lon
            },
            value: this.mapUrl,
            title: this.property.Billing_Street__c,
            description: this.property.Billing_City__c + ", " + this.property.Billing_State__c + " " + this.property.Billing_Postal_Code__c,
            mapIcon: {
                path: "M6.5 14.5v-3.505c0-.245.25-.495.5-.495h2c.25 0 .5.25.5.5v3.5a.5.5 0 0 0 .5.5h4a.5.5 0 0 0 .5-.5v-7a.5.5 0 0 0-.146-.354L13 5.793V2.5a.5.5 0 0 0-.5-.5h-1a.5.5 0 0 0-.5.5v1.293L8.354 1.146a.5.5 0 0 0-.708 0l-6 6A.5.5 0 0 0 1.5 7.5v7a.5.5 0 0 0 .5.5h4a.5.5 0 0 0 .5-.5z",
                fillColor: "#007cfb",
                fillOpacity: 1,
                strokeWeight: 1,
                scale: 2
            }
        });
    }

    // Populate all markers after search parameters chosen
    populateMarkers() {
        // Property Marker
        this.populatePropertyMarker();

        // Hotel Markers
        if (this.hotels && this.hotelSelected && this.hotels.length > 0) {
            for (let i = 0; i < this.hotels.length; i++) {
                this.mapMarkers.push({
                    location: {
                        Latitude: this.hotels[i].latitude,
                        Longitude: this.hotels[i].longitude
                    },
                    value: this.hotels[i].url,
                    title: this.hotels[i].name,
                    description: this.hotels[i].rating,
                    mapIcon: {
                        path: "M480 0C497.7 0 512 14.33 512 32C512 49.67 497.7 64 480 64V448C497.7 448 512 462.3 512 480C512 497.7 497.7 512 480 512H304V448H208V512H32C14.33 512 0 497.7 0 480C0 462.3 14.33 448 32 448V64C14.33 64 0 49.67 0 32C0 14.33 14.33 0 32 0H480zM112 96C103.2 96 96 103.2 96 112V144C96 152.8 103.2 160 112 160H144C152.8 160 160 152.8 160 144V112C160 103.2 152.8 96 144 96H112zM224 144C224 152.8 231.2 160 240 160H272C280.8 160 288 152.8 288 144V112C288 103.2 280.8 96 272 96H240C231.2 96 224 103.2 224 112V144zM368 96C359.2 96 352 103.2 352 112V144C352 152.8 359.2 160 368 160H400C408.8 160 416 152.8 416 144V112C416 103.2 408.8 96 400 96H368zM96 240C96 248.8 103.2 256 112 256H144C152.8 256 160 248.8 160 240V208C160 199.2 152.8 192 144 192H112C103.2 192 96 199.2 96 208V240zM240 192C231.2 192 224 199.2 224 208V240C224 248.8 231.2 256 240 256H272C280.8 256 288 248.8 288 240V208C288 199.2 280.8 192 272 192H240zM352 240C352 248.8 359.2 256 368 256H400C408.8 256 416 248.8 416 240V208C416 199.2 408.8 192 400 192H368C359.2 192 352 199.2 352 208V240zM256 288C211.2 288 173.5 318.7 162.1 360.2C159.7 373.1 170.7 384 184 384H328C341.3 384 352.3 373.1 349 360.2C338.5 318.7 300.8 288 256 288z",
                        fillColor: "#8336f7",
                        fillOpacity: 1,
                        strokeWeight: 1,
                        scale: 0.05
                    }
                });
            }
        }

        // Restaurant Markers
        if (this.restaurants && this.restaurantSelected && this.restaurants.length > 0) {
            for (let i = 0; i < this.restaurants.length; i++) {
                this.mapMarkers.push({
                    location: {
                        Latitude: this.restaurants[i].latitude,
                        Longitude: this.restaurants[i].longitude
                    },
                    value: this.restaurants[i].url,
                    title: this.restaurants[i].name,
                    description: this.restaurants[i].rating,
                    mapIcon: {
                        path: "M3.5 0l-1 5.5c-0.1464 0.805 1.7815 1.181 1.75 2L4 14c-0.0384 0.9993 1 1 1 1s1.0384-0.0007 1-1L5.75 7.5 c-0.0314-0.8176 1.7334-1.1808 1.75-2L6.5 0H6l0.25 4L5.5 4.5L5.25 0h-0.5L4.5 4.5L3.75 4L4 0H3.5z M12 0 c-0.7364 0-1.9642 0.6549-2.4551 1.6367C9.1358 2.3731 9 4.0182 9 5v2.5c0 0.8182 1.0909 1 1.5 1L10 14c-0.0905 0.9959 1 1 1 1 s1 0 1-1V0z",
                        fillColor: "#6cd81f",
                        fillOpacity: 1,
                        strokeWeight: 1,
                        scale: 2
                    }
                });
            }
        }

        // Airport Markers
        if (this.airports && this.airportSelected && this.airports.length > 0) {
            for (let i = 0; i < this.airports.length; i++) {
                this.mapMarkers.push({
                    location: {
                        Latitude: this.airports[i].latitude,
                        Longitude: this.airports[i].longitude
                    },
                    value: this.airports[i].url,
                    title: this.airports[i].name,
                    description: this.airports[i].rating,
                    mapIcon: {
                        path: "M192 93.68C192 59.53 221 0 256 0C292 0 320 59.53 320 93.68V160L497.8 278.5C506.7 284.4 512 294.4 512 305.1V361.8C512 372.7 501.3 380.4 490.9 376.1L320 319.1V400L377.6 443.2C381.6 446.2 384 450.1 384 456V497.1C384 505.7 377.7 512 369.1 512C368.7 512 367.4 511.8 366.1 511.5L256 480L145.9 511.5C144.6 511.8 143.3 512 142 512C134.3 512 128 505.7 128 497.1V456C128 450.1 130.4 446.2 134.4 443.2L192 400V319.1L21.06 376.1C10.7 380.4 0 372.7 0 361.8V305.1C0 294.4 5.347 284.4 14.25 278.5L192 160L192 93.68z",
                        fillColor: "#477ff0",
                        fillOpacity: 1,
                        strokeWeight: 1,
                        scale: 0.05
                    }
                });
            }
        }

        // School Markers
        if (this.schools && this.schoolSelected && this.schools.length > 0) {
            for (let i = 0; i < this.schools.length; i++) {
                this.mapMarkers.push({
                    location: {
                        Latitude: this.schools[i].latitude,
                        Longitude: this.schools[i].longitude
                    },
                    value: this.schools[i].url,
                    title: this.schools[i].name,
                    description: this.schools[i].rating,
                    mapIcon: {
                        path: "M53.36 3.31c8.7-6.01 9.35 5.89 17.89-1.55V13.9c-8.14 7.33-9.9-4.51-17.89 1.5V3.31L53.36 3.31L53.36 3.31z M49.45 37.01h1.52c0.28 0 0.5 0.23 0.5 0.5v5.84h5.33c0.28 0 0.5 0.23 0.5 0.5v1.52c0 0.28-0.23 0.5-0.5 0.5h-7.86v-8.37 C48.94 37.24 49.17 37.01 49.45 37.01L49.45 37.01L49.45 37.01z M51.17 30.17c6.85 0 12.4 5.55 12.4 12.4 c0 6.85-5.55 12.4-12.4 12.4c-6.85 0-12.4-5.55-12.4-12.4C38.77 35.73 44.32 30.17 51.17 30.17L51.17 30.17L51.17 30.17z M52.87 71.74v40.27h12.25V71.74H52.87L52.87 71.74z M49.47 112.01V71.74H37.22l0 0v40.27H49.47L49.47 112.01z M102.34 122.85 V51.86H75.38V34.67L52.13 19.69V3.09h-0.08c0.49-0.28 0.81-0.82 0.81-1.43c0-0.92-0.74-1.66-1.66-1.66s-1.66 0.74-1.66 1.66 c0 0.61 0.33 1.14 0.81 1.43h-0.08v16.57l-23.3 15.01v17.19H7.23H0v71.02C34.12 122.88 68.22 122.85 102.34 122.85L102.34 122.85 L102.34 122.85z M10.99 71.74h13.49v5.25H10.99V71.74L10.99 71.74L10.99 71.74z M77.85 71.74h13.49v5.25H77.85V71.74L77.85 71.74 L77.85 71.74z M10.99 83.33h13.49v5.25H10.99V83.33L10.99 83.33L10.99 83.33z M77.85 83.33h13.49v5.25H77.85V83.33L77.85 83.33 L77.85 83.33z M10.99 94.92h13.49v5.25H10.99V94.92L10.99 94.92L10.99 94.92z M77.85 94.92h13.49v5.25H77.85V94.92L77.85 94.92 L77.85 94.92z M10.99 106.51h13.49v5.25H10.99V106.51L10.99 106.51L10.99 106.51z M77.85 106.51h13.49v5.25H77.85V106.51 L77.85 106.51L77.85 106.51z",
                        fillColor: "#e2fc22",
                        fillOpacity: 1,
                        strokeWeight: 1,
                        scale: 0.25
                    }
                });
            }
        }

        // Gym Markers
        if (this.gyms && this.gymSelected && this.gyms.length > 0) {
            for (let i = 0; i < this.gyms.length; i++) {
                this.mapMarkers.push({
                    location: {
                        Latitude: this.gyms[i].latitude,
                        Longitude: this.gyms[i].longitude
                    },
                    value: this.gyms[i].url,
                    title: this.gyms[i].name,
                    description: this.gyms[i].rating,
                    mapIcon: {
                        path: "M8.94 102.48h85.62c3.71-3.85 8.02-14.75 12.45-25.96c1.41-3.57 2.83-7.17 4.3-10.66 c-6.43 0.02-15.18-0.61-16.52-2.15c-1.04-1.19-0.66-2.93 0.91-5.12l18.93-18.48c1.77-1.6 3.31-2.21 4.62-1.81 c1.3 0.39 2.38 1.76 3.23 4.13c0.48 7.13 0.43 14.27-0.63 21.4c-0.58 0.34-1.18 0.63-1.79 0.89c-2.01 4.48-4.01 9.56-6 14.58 c-3.41 8.63-6.75 17.09-10.52 23.18h10.39c4.92 0 8.94 4.02 8.94 8.94v0c0 4.92-4.02 8.94-8.94 8.94h-105 c-4.92 0-8.94-4.02-8.94-8.94v0C0 106.51 4.02 102.48 8.94 102.48L8.94 102.48z M36.43 36.39l-0.27-0.45l-7.06 1.01L26.54 52.6 c-0.48 2.93-3.23 4.91-6.16 4.44c-2.93-0.48-4.91-3.23-4.44-6.16l3.2-19.55c0.39-2.38 2.28-4.13 4.54-4.45l0 0l13.67-1.96 l10.11-2.21c5.76 0.19 10.06 2.61 12 7.7c0.28 0.35 0.52 0.75 0.71 1.18l5.42 12.39l17.68 1.1c2.96 0.17 5.22 2.72 5.04 5.68 c-0.17 2.96-2.72 5.22-5.68 5.05l-20.97-1.3c-2.16-0.13-3.95-1.52-4.69-3.41l-1.1-2.51l-2.25 9.79l14.84 8.74 c1.29 0.75 2.14 1.96 2.48 3.3l0.02 0l5.39 21.11c0.73 2.88-1.01 5.81-3.89 6.54c-2.88 0.73-5.81-1.01-6.54-3.89L61.1 75.19 l-1.24-0.73l-15.42-5.87l-0.83 0.46l-4.71 12.49c-0.34 0.9-0.89 1.65-1.58 2.23l0 0L19.65 98.6c-2.28 1.9-5.66 1.6-7.57-0.67 c-1.9-2.28-1.6-5.66 0.67-7.57L29.03 76.7C30.22 62.9 32.82 49.5 36.43 36.39L36.43 36.39z M57.91 0c5.64 0 10.21 4.57 10.21 10.21 c0 5.64-4.57 10.21-10.21 10.21c-5.64 0-10.21-4.57-10.21-10.21C47.7 4.57 52.27 0 57.91 0L57.91 0z",
                        fillColor: "#f63159",
                        fillOpacity: 1,
                        strokeWeight: 1,
                        scale: 0.25
                    }
                });
            }
        }

        // Bank Markers
        if (this.banks && this.bankSelected && this.banks.length > 0) {
            for (let i = 0; i < this.banks.length; i++) {
                this.mapMarkers.push({
                    location: {
                        Latitude: this.banks[i].latitude,
                        Longitude: this.banks[i].longitude
                    },
                    value: this.banks[i].url,
                    title: this.banks[i].name,
                    description: this.banks[i].rating,
                    mapIcon: {
                        path: "M11.18 166.57 246.07 0l236.1 166.57H11.18zm414.96 156.44-5.39-24.71c23.12 4.31 60.2 51.38 72.19 72.78 6.12 10.92 11.48 22.96 15.86 36.41 8.75 32.55.33 63-34.99 70.09-22.13 4.46-63.4 4.77-86.66 3.56-25.03-1.28-63.74-1.25-73.86-26.94-16.31-41.46 13.58-90.85 40.85-121.09 3.6-3.98 7.32-7.68 11.14-11.11 9.92-8.72 20.62-19.08 33.39-23.38l-12.34 22.96 17.92-23.75h9.42l12.47 25.18zm-11.53 19.59v6.95c4.58.49 8.52 1.43 11.79 2.83 3.29 1.42 6.14 3.55 8.59 6.43 1.93 2.19 3.42 4.44 4.47 6.74 1.05 2.33 1.58 4.43 1.58 6.36 0 2.15-.79 4.02-2.35 5.57-1.57 1.56-3.46 2.35-5.69 2.35-4.21 0-6.95-2.28-8.18-6.82-1.43-5.35-4.83-8.92-10.21-10.68v26.72c5.3 1.45 9.55 2.79 12.69 3.99 3.15 1.19 5.98 2.92 8.46 5.2 2.65 2.35 4.71 5.17 6.16 8.44 1.42 3.29 2.14 6.86 2.14 10.76 0 4.89-1.13 9.45-3.43 13.7-2.31 4.28-5.68 7.74-10.13 10.46-4.48 2.7-9.76 4.3-15.89 4.8v16c0 2.52-.25 4.37-.75 5.53-.49 1.16-1.56 1.73-3.25 1.73-1.53 0-2.6-.46-3.24-1.4-.62-.95-.92-2.42-.92-4.39v-17.34c-5-.54-9.38-1.73-13.13-3.53-3.75-1.79-6.89-4.03-9.39-6.71-2.49-2.69-4.36-5.48-5.54-8.35-1.21-2.89-1.8-5.74-1.8-8.53 0-2.03.79-3.9 2.41-5.54 1.6-1.64 3.6-2.48 5.99-2.48 1.93 0 3.55.44 4.88 1.34 1.32.9 2.24 2.17 2.77 3.79 1.14 3.51 2.15 6.21 3 8.07.88 1.86 2.17 3.57 3.9 5.11 1.73 1.53 4.04 2.71 6.91 3.53v-29.86c-5.75-1.6-10.53-3.35-14.38-5.3-3.86-1.96-7-4.72-9.38-8.31-2.39-3.6-3.6-8.22-3.6-13.88 0-7.36 2.35-13.41 7.04-18.11 4.69-4.71 11.46-7.45 20.32-8.22v-6.81c0-3.6 1.36-5.4 4.05-5.4 2.75 0 4.11 1.76 4.11 5.26zm-8.16 44.07v-24.6c-3.6 1.08-6.4 2.48-8.42 4.23-2.02 1.75-3.03 4.43-3.03 7.98 0 3.37.95 5.94 2.83 7.67 1.89 1.74 4.76 3.31 8.62 4.72zm8.16 19.07v28.14c4.31-.85 7.65-2.58 10.01-5.19 2.35-2.63 3.53-5.66 3.53-9.14 0-3.73-1.14-6.6-3.44-8.64-2.28-2.04-5.66-3.77-10.1-5.17zm-23.46-142.75c-4.08-12.02-7.76-24.2-10.85-36.56 11.55-12.68 56.24-10.99 69.08-.19l-11.89 28.28c6.4-8.4 8.55-11.85 12.37-16.54 1.59 1.05 3.11 2.23 4.53 3.52 3.38 3.07 6.4 6.45 7.02 11.16.39 3.06-.49 6.18-3.2 9.35L430.9 293.8c-3.5-.58-6.94-1.41-10.27-2.6 1.55-3.64 3.42-7.65 4.96-11.29l-9.94 10.73c-10.34-2.19-18.67-.89-26.43 3.22l-27.68-33.23c-1.64-1.97-2.38-3.96-2.38-5.93.03-8.04 11.99-14.96 18.27-17.59l13.72 25.88zM0 409.64h27.32v-25.35h14.33v-12.1h15.42v-145.1H25.55v-34.77h367.39c-12.5 2.38-23.86 7.12-31.36 14.51a27.239 27.239 0 0 0-7.33 12.15c-3.14 2.06-6.26 4.46-9.03 7.12l-1 .99h-15.8v94.31c-15.65 18.55-31.3 42.46-39.91 67.98-5.15 15.26-7.82 31.07-6.71 46.81H0v-26.55zm433.74-217.32h32.81v13.07c-7.58-6.27-19.7-10.74-32.81-13.07zM130.53 384.29h17.78v-12.1h15.42v-145.1h-48.62v145.1h15.42v12.1zm106.65 0H255v-12.1h15.38v-145.1h-48.62v145.1h15.42v12.1zm-70.21-259.73 79.46-60.96 79.9 60.96H166.97z",
                        fillColor: "#569e23",
                        fillOpacity: 1,
                        strokeWeight: 1,
                        scale: 0.05
                    }
                });
            }
        }

        // Hospital Markers
        if (this.hospitals && this.hospitalSelected && this.hospitals.length > 0) {
            for (let i = 0; i < this.hospitals.length; i++) {
                this.mapMarkers.push({
                    location: {
                        Latitude: this.hospitals[i].latitude,
                        Longitude: this.hospitals[i].longitude
                    },
                    value: this.hospitals[i].url,
                    title: this.hospitals[i].name,
                    description: this.hospitals[i].rating,
                    mapIcon: {
                        path: "M49.93 0h23.01c4.3 0 7.82 3.52 7.82 7.82v34.3h34.3c4.3 0 7.82 3.52 7.82 7.82v23.01 c0 4.3-3.52 7.82-7.82 7.82h-34.3v34.3c0 4.3-3.52 7.82-7.82 7.82H49.93c-4.3 0-7.82-3.52-7.82-7.82v-34.3H7.82 c-4.3 0-7.82-3.52-7.82-7.82V49.93c0-4.3 3.52-7.82 7.82-7.82h34.3V7.82C42.12 3.52 45.63 0 49.93 0L49.93 0z",
                        fillColor: "#f11616",
                        fillOpacity: 1,
                        strokeWeight: 1,
                        scale: 0.18
                    }
                });
            }
        }

        // Supermarket Markers
        if (this.supermarkets && this.supermarketSelected && this.supermarkets.length > 0) {
            for (let i = 0; i < this.supermarkets.length; i++) {
                this.mapMarkers.push({
                    location: {
                        Latitude: this.supermarkets[i].latitude,
                        Longitude: this.supermarkets[i].longitude
                    },
                    value: this.supermarkets[i].url,
                    title: this.supermarkets[i].name,
                    description: this.supermarkets[i].rating,
                    mapIcon: {
                        path: "M3.93 7.86A3.93 3.93 0 0 1 3.93 0H14.15l.39 0A18.28 18.28 0 0 1 24.1 2.49a14.69 14.69 0 0 1 6.41 9.1c.32 1.41.66 2.82 1 4.23H119a3.92 3.92 0 0 1 3.93 3.92 4 4 0 0 1-.19 1.22L112.52 62.08a3.92 3.92 0 0 1-3.8 3H44.66c1.44 5.21 2.76 8 4.7 9.34 2.27 1.52 6.31 1.63 13 1.52h.07v0h45.17a3.93 3.93 0 1 1 0 7.86H62.46v0c-8.27.15-13.38-.09-17.46-2.84s-6.36-7.55-8.57-16.3l-13.51-51a7.19 7.19 0 0 0-3-4.49 10.8 10.8 0 0 0-5.51-1.3H3.93ZM96 88.34a9.6 9.6 0 1 1-9.6 9.6 9.6 9.6 0 0 1 9.6-9.6Zm-42.1 0a9.6 9.6 0 1 1-9.6 9.6 9.6 9.6 0 0 1 9.6-9.6ZM78 23.67V38h32.45l3.53-14.28Zm0 22.14V57.22h27.69l2.82-11.41ZM70.11 57.22V45.81H39.63q1.57 5.7 3 11.41Zm0-19.27V23.67H33.54c1.26 4.76 2.58 9.52 3.91 14.28Z",
                        fillColor: "#30def6",
                        fillOpacity: 1,
                        strokeWeight: 1,
                        scale: 0.25
                    }
                });
            }
        }
    }

    // When marker selected
    handleMarkerSelect(event) {
        this.selectedMarkerValue = event.target.selectedMarkerValue;
        if (!this.anyMarkerSelected) this.anyMarkerSelected = true;
    }

    // Close modal (API results are still saved as long as page not reloaded)
    handleClose() {
        this.close();
    }
}