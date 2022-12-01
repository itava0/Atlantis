import { LightningElement, wire, track } from 'lwc';
import { publish, MessageContext } from 'lightning/messageService';
import { refreshApex } from '@salesforce/apex';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import FILTERSCHANGEMC from '@salesforce/messageChannel/FiltersChange__c';
import doAddressGeocodeInput from '@salesforce/apex/PropertyGeocode.DoAddressGeocodeInput';
import getAddresses from '@salesforce/apex/getAddresses.getAddressInfo';
import getProperties from '@salesforce/apex/getProperties.getAllProperties';

const DELAY = 350;
const MAX_PRICE = 50000;
const RADIUS = 395;

export default class PropertyFilter extends LightningElement {
    searchKey = '';
    recordType = 'Any';
    maxPrice = MAX_PRICE;
    minBedrooms = 0;
    minBathrooms = 0;
    minRating = 0;
    value = 'Any';

    curStreet;
    curCity;
    curState = 'Georgia';
    curPostalCode;
    curDistance;
    evtStreet;
    evtCity;
    evtState = 'Georgia';
    evtPostalCode;
    evtDistance;

    @track wiredAddresses = [];
    @track addresses = [];
    @track wiredProperties = [];
    @track properties = [];
    @track error;

    // For calculating distance
    distances = [];
    streets = [];
    cities = [];
    distance;
    lat1;
    lon1;
    lat2;
    lon2;
    dlon;
    dlat;
    a;
    c;

    @wire(MessageContext)
    messageContext;

    get options() {
        return [
            { label: 'Any', value: 'Any'},
            { label: 'Apartment', value: 'Apartment'},
            { label: 'Single Family', value: 'Single Family'},
            { label: 'Townhouse', value: 'Townhouse'},
        ];
    }

    handleReset() {
        this.searchKey = '';
        this.recordType = 'Any';
        this.maxPrice = MAX_PRICE;
        this.minBedrooms = 0;
        this.minBathrooms = 0;
        this.minRating = 0;
        this.fireChangeEvent();
    }

    handleSearchKeyChange(event) {
        this.searchKey = event.detail.value;
        this.fireChangeEvent();
    }

    handleRecordTypeChange(event) {
        this.value = event.detail.value;
        this.recordType = event.detail.value;
        this.fireChangeEvent();
    }

    handleMaxPriceChange(event) {
        this.maxPrice = event.detail.value;
        this.fireChangeEvent();
    }

    handleMinBedroomsChange(event) {
        this.minBedrooms = event.detail.value;
        this.fireChangeEvent();
    }

    handleMinBathroomsChange(event) {
        this.minBathrooms = event.detail.value;
        this.fireChangeEvent();
    }

    handleMinRatingChange(event) {
        this.minRating = event.detail.value;
        this.fireChangeEvent();
    }

    fireChangeEvent() {
        // Debouncing this method: Do not actually fire the event as long as this function is
        // being called within a delay of DELAY. This is to avoid a very large number of Apex
        // method calls in components listening to this event.
        window.clearTimeout(this.delayTimeout);
        // eslint-disable-next-line @lwc/lwc/no-async-operation
        this.delayTimeout = setTimeout(() => {
            const filters = {
                searchKey: this.searchKey,
                recordType: this.recordType,
                maxPrice: this.maxPrice,
                minBedrooms: this.minBedrooms,
                minBathrooms: this.minBathrooms,
                minRating: this.minRating
            };
            publish(this.messageContext, FILTERSCHANGEMC, filters);
        }, DELAY);
    }

    geoAddress() {
        // Get geo of inputted address
        this.evtStreet = this.curStreet;
        this.evtCity = this.curCity;
        this.evtState = this.curState;
        this.evtPostalCode = this.curPostalCode;

        doAddressGeocodeInput({iStreet: this.evtStreet, iCity: this.evtCity, iState: this.evtState, iPostalCode: this.evtPostalCode})
        .then(() => {
            if (this.evtStreet && this.evtCity && this.evtState && this.evtPostalCode) {
                const toastEvt = new ShowToastEvent({
                    title: 'Address geocoded',
                    variant: 'success'
                })
                this.dispatchEvent(toastEvt);
            }

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
                if (this.addresses[i].Street__c == this.evtStreet && this.addresses[i].City__c == this.evtCity &&
                this.addresses[i].State__c == this.evtState && this.addresses[i].PostalCode__c == this.evtPostalCode) {
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
        if (this.distances.length > 0) {
            for (let k = 0; k < this.properties.length; k++) {
                if (this.distances[k] <= this.evtDistance) {
                    console.log("IN RANGE", this.streets[k], this.cities[k], this.distances[k]);
                } else {
                    // console.log("OUT OF RANGE", this.streets[k], this.cities[k], this.distances[k]);
                }
            }
        } else {
            console.log("PLEASE GEO ADDRESS")
            const toastEvt = new ShowToastEvent({
                title: 'No address data found',
                message: 'Please first save address with "Geo Address". You may need to wait a few seconds.',
                variant: 'warning'
            })
            this.dispatchEvent(toastEvt);
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
}
