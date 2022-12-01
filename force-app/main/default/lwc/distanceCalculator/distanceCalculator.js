import { LightningElement, wire, track } from 'lwc';
import {
    publish,
    subscribe,
    unsubscribe,
    MessageContext
} from 'lightning/messageService';
import { refreshApex } from '@salesforce/apex'
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import FILTERSCHANGEMC from '@salesforce/messageChannel/FiltersChange__c';
import PROPERTYSELECTEDMC from '@salesforce/messageChannel/PropertySelected__c';
import getPagedPropertyList from '@salesforce/apex/PropertyController.getPagedPropertyList';
import doAddressGeocodeInput from '@salesforce/apex/PropertyGeocode.DoAddressGeocodeInput';
import getAddresses from '@salesforce/apex/getAddresses.getAddressInfo';
import getProperties from '@salesforce/apex/getProperties.getAllProperties';

const RADIUS = 395;

export default class DistanceCalculator extends LightningElement {

    @wire(MessageContext)
    messageContext;

    @wire(getPagedPropertyList, {
        searchKey: '$searchKey',
        recordType: '$recordType',
        maxPrice: '$maxPrice',
        minBedrooms: '$minBedrooms',
        minBathrooms: '$minBathrooms',
        minRating: '$minRating',
        pageSize: '$pageSize',
        pageNumber: '$pageNumber'
    })
    properties;

    curStreet
    curCity
    curState
    curPostalCode
    curDistance
    evtStreet
    evtCity
    evtState
    evtPostalCode
    evtDistance

    @track wiredAddresses = []
    @track addresses = []
    @track wiredProperties = []
    @track properties = []
    @track error

    // For calculating distance
    distances = []
    streets = []
    cities = []
    distance
    lat1
    lon1
    lat2
    lon2
    dlon
    dlat
    a
    c

    
    geoAddress() {
        // Get geo of inputted address
        this.evtStreet = this.curStreet;
        this.evtCity = this.curCity;
        this.evtState = this.curState;
        this.evtPostalCode = this.curPostalCode;

        doAddressGeocodeInput({iStreet: this.evtStreet, iCity: this.evtCity, iState: this.evtState, iPostalCode: this.evtPostalCode})
        .then(() => {
            const toastEvt = new ShowToastEvent({
                title: 'Address geocoded',
                variant: 'success'
            })
            this.dispatchEvent(toastEvt);

            return refreshApex(this.wiredAddresses);
        })
        .catch(error => {
            console.log(error.message);
        });
    }

    getDistance() {
        refreshApex(this.wiredAddresses);

        this.evtDistance = this.curDistance;
        this.streets = [];
        this.cities = [];
        this.distances = [];

        // Check Addresses and If Match, Calculate Distance
        for (let i = 0; i < 5; i++) {
            if (this.addresses[i].Latitude__c != null && this.addresses[i].Longitude__c != null) {
                if (this.addresses[i].Street__c == this.curStreet && this.addresses[i].City__c == this.curCity &&
                this.addresses[i].State__c == this.curState && this.addresses[i].PostalCode__c == this.curPostalCode) {
                    this.lat1 = this.addresses[i].Latitude__c;
                    this.lon1 = this.addresses[i].Longitude__c;
                    for (let j = 0; j < this.properties.length; j++) {
                        this.lat2 = this.properties[j].Geolocation__Latitude__s;
                        this.lon2 = this.properties[j].Geolocation__Longitude__s;
                        this.distance = this.calculateDistance(this.lat1, this.lon1, this.lat2, this.lon2);
                        // console.log("DISTANCE", this.properties[j].Billing_Street__c, this.properties[j].Billing_City__c, this.distance);
                        this.streets.push(this.properties[j].Billing_Street__c);
                        this.cities.push(this.properties[j].Billing_City__c);
                        this.distances.push(this.distance);
                    }
                }
            } else {
                console.log('No matching geocoded address found.');
            }
        }

        // Filter Out Properties That Exceed Max Distance
        if (this.distances) {
            for (let k = 0; k < this.properties.length; k++) {
                if (this.distances[k] <= this.curDistance) {
                    console.log("IN RANGE", this.streets[k], this.cities[k], this.distances[k]);
                } else {
                    // console.log("OUT OF RANGE", this.streets[k], this.cities[k], this.distances[k]);
                }
            }
        }
    }

    // Fetch Address Records
    @wire (getAddresses) getAddresses(result) {
        this.wiredAddresses = result;

        if (result.data) {
            this.addresses = result.data;
            this.error = undefined;
        } else if (result.error) {
            this.error = result.error;
            this.addresses = [];
        }
    }

    // Fetch Property Records
    @wire (getProperties) getProperties(result) {
        this.wiredProperties = result;

        if (result.data) {
            this.properties = result.data;
            this.error = undefined;
        } else if (result.error) {
            this.error = result.error;
            this.properties = [];
        }
    }

    // Math: Calculate Distance Given Two Sets of Geo Coordinates
    calculateDistance(lat1, lon1, lat2, lon2) {
        // Convert degrees to radians
        lat1 = lat1 * Math.PI / 180;
        lon1 = lon1 * Math.PI / 180;
        lat2 = lat2 * Math.PI / 180;
        lon2 = lon2 * Math.PI / 180;

        // Haversine formula
        this.dlon = lon2 - lon1;
        this.dlat = lat2 - lat1;
        this.a = Math.pow(Math.sin(this.dlat / 2), 2) +
                 Math.cos(lat1) * Math.cos(lat2) *
                 Math.pow(Math.sin(this.dlon / 2), 2);
        this.c = 2 * Math.asin(Math.sqrt(this.a));
        
        return (this.c * RADIUS);
    }

    handleStreetChange(event) {
        this.curStreet = event.target.value;
    }

    handleCityChange(event) {
        this.curCity = event.target.value;
    }

    handleStateChange(event) {
        this.curState = event.target.value;
    }

    handlePostalCodeChange(event) {
        this.curPostalCode = event.target.value;
    }

    handleDistanceChange(event) {
        this.curDistance = event.target.value;
    }

    connectedCallback() {
        this.subscription = subscribe(
            this.messageContext,
            FILTERSCHANGEMC,
            (message) => {
                this.handleFilterChange(message);
            }
        );
    }

    disconnectedCallback() {
        unsubscribe(this.subscription);
        this.subscription = null;
    }

    handleFilterChange(filters) {
        this.searchKey = filters.searchKey;
        this.recordType = filters.recordType;
        this.maxPrice = filters.maxPrice;
        this.minBedrooms = filters.minBedrooms;
        this.minBathrooms = filters.minBathrooms;
        this.minRating = filters.minRating;
    }

    
    handlePropertySelected(event) {
        const message = { propertyId: this.selectedMarkerValue };
        publish(this.messageContext, PROPERTYSELECTEDMC, message);
    }
    
}