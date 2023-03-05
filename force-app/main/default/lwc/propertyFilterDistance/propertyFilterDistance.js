import { LightningElement, wire, track, api } from "lwc";
import { MessageContext, subscribe, unsubscribe } from "lightning/messageService";
import { getPicklistValues } from "lightning/uiObjectInfoApi";
import STATE_FIELD from "@salesforce/schema/Property__c.Billing_State__c";
import GOTUSERLOCATIONMC from "@salesforce/messageChannel/GotUserLocation__c";
import geocodeDistance from "@salesforce/apex/PropertyGeocode.geocodeAddressForDistance";

export default class PropertyFilterDistance extends LightningElement {

    @api properties;
    @track error;
    pageNumber = 1;
    subscription;
    @track eventDetail;
    @track propsInDistance;
    distance = 0;
    addressLat;
    addressLon;
    maxDistance;
    filteringDistance = false;
    canFind = false;

    // Stores user-inputted address information (cur = value in input fields, evt = sent to API)
    curStreet;
    curCity;
    curState = "Georgia";
    curPostalCode;
    curDistance;
    evtStreet;
    evtCity;
    evtState = "Georgia";
    evtPostalCode;
    evtDistance;

    // For retrieving user location
    userLatitude = 0;
    userLongitude = 0;
    userLocated = false;
    useLocation = false;
    locGot = false;

    @wire(MessageContext)
    messageContext;

    // Reset inputs and their values from parent's Reset button
    @api resetInputs() {
        this.template.querySelectorAll("lightning-input").forEach((element) => {
            element.value = null;
            element.checked = false;
        });

        this.curState = "Georgia";
        this.propsInDistance = [];
        this.curDistance = 0;
        this.evtDistance = 0;
        this.useLocation = false;
        this.filteringDistance = false;
        this.canFind = false;
        this.pageNumber = 1;
    }

    // Updating street in distance calculator
    handleStreetChange(event) {
        this.curStreet = event.target.value;
        this.checkIfCanFind();
    }

    // Updating city in distance calculator
    handleCityChange(event) {
        this.curCity = event.target.value;
        this.checkIfCanFind();
    }

    // Updating state in distance calculator
    handleStateChange(event) {
        this.curState = event.target.value;
        this.checkIfCanFind();
    }

    // Updating postal code in distance calculator
    handlePostalCodeChange(event) {
        this.curPostalCode = event.target.value;
        this.checkIfCanFind();
    }

    // Updating max distance in distance calculator
    handleDistanceChange(event) {
        this.curDistance = event.target.value;
        this.checkIfCanFind();
    }

    // Toggle whether or not user will use current location feature (if available)
    handleUseLocationChange(event) {
        this.useLocation = event.target.checked;
        this.checkIfCanFind();
    }

    // Determines whether "Find Properties" button should be enabled
    checkIfCanFind() {
        this.canFind = false;

        if (!this.useLocation) {
            // When Filtering by Given Address: Requires All Address Fields and a Distance
            if (this.curStreet && this.curCity && this.curState && this.curPostalCode && this.curDistance) {
                this.canFind = true;
            }
        } else {
            // When Filtering by User Location: Requires a Distance
            if (this.curDistance) this.canFind = true;
        }
    }

    // Get options for state picklist (using Property's Billing State picklist options)
    @wire(getPicklistValues, { recordTypeId: '012Dn000000gZGMIA2', fieldApiName: STATE_FIELD })
    stateOptions;

    // Get distance
    getDistance() {
        if (!this.useLocation) {
            if (this.curStreet != this.evtStreet || this.curCity != this.evtCity || this.curState != this.evtState || this.curPostalCode != this.evtPostalCode) {
                // Store user-inputted address information, to avoid repeated API calls if no changes have been made
                this.evtStreet = this.curStreet;
                this.evtCity = this.curCity;
                this.evtState = this.curState;
                this.evtPostalCode = this.curPostalCode;
                this.evtDistance = this.curDistance;
    
                // Geocode address using an Apex method calling Google Maps API (no longer needs to be stored in separate Address record)
                geocodeDistance({ iStreet: this.evtStreet, iCity: this.evtCity, iState: this.evtState, iPostalCode: this.evtPostalCode })
                .then((result) => {
                    // Store returned latitude and longitude
                    this.addressLat = result.lat;
                    this.addressLon = result.lon;
    
                    // For each property, calculate distance
                    this.getPropertyDistances(this.addressLat, this.addressLon, this.evtDistance);
                })
                .catch((error) => {
                    this.error = error;
                });
            } else {
                // If the address information is identical, recalculate distances without the need for repeated API calls
                this.evtDistance = this.curDistance;
                this.getPropertyDistances(this.addressLat, this.addressLon, this.evtDistance);
            }
        } else {
            // For when "Use Current Location" is checked, uses retrieved geolocation data from user instead of inputted address
            this.evtDistance = this.curDistance;
            this.getPropertyDistances(this.userLatitude, this.userLongitude, this.evtDistance);
        }
    }

    // For each property, calculate distance using lat & lon of each property combined with lat & lon of the given address
    getPropertyDistances(addressLat, addressLon, distance) {
        // Initialize values
        this.filteringDistance = true;
        let maxDistance = parseFloat(distance);
        this.propsInDistance = [];

        // If property is within distance, add to array of Ids to be sent back to parent
        for (let i = 0; i < this.properties.length; i++) {
            this.distance = this.calculateDistance(addressLat, addressLon, this.properties[i].Geolocation__Latitude__s, this.properties[i].Geolocation__Longitude__s);
            if (this.distance < maxDistance) {
                this.propsInDistance.push(this.properties[i].Id);
            }
        }

        this.fireChangeEvent();
    }

    calculateDistance(lat1, lon1, lat2, lon2) {
        // Earth's radius in kilometers
        var R = 6371;
    
        // Convert latitude and longitude values from degrees to radians
        var dLat = (lat2 - lat1) * (Math.PI / 180);
        var dLon = (lon2 - lon1) * (Math.PI / 180);
        lat1 = lat1 * (Math.PI / 180);
        lat2 = lat2 * (Math.PI / 180);
    
        // Apply the Haversine formula to calculate the distance between the two points
        var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        var d = R * c;
    
        // Return the distance in miles
        return d * 0.621371192;
    }

    // Sends custom event back to parent component with updated information
    fireChangeEvent() {
        if (!this.evtDistance) this.evtDistance = 0;

        this.eventDetail = {
            propsInDistance: this.propsInDistance,
            distance: this.evtDistance,
            userLatitude: this.userLatitude,
            userLongitude: this.userLongitude,
            addressLatitude: this.addressLat,
            addressLongitude: this.addressLon,
            useLocation: this.useLocation,
            filteringDistance: this.filteringDistance,
            pageNumber: this.pageNumber
        }

        const updatedDistance = new CustomEvent("distanceupdate", {
            detail: this.eventDetail
        });

        this.dispatchEvent(updatedDistance);
    }

    // Subscribe to message channel
    connectedCallback() {
        // Subscription: User location message channel
        this.subscription = subscribe(
            this.messageContext,
            GOTUSERLOCATIONMC,
            (message) => {
                this.handleMessage(message);
            }
        );
    }

    // Upon retrieving user location, update relevant values
    handleMessage(message) {
        this.userLatitude = message.latitude;
        this.userLongitude = message.longitude;
        this.userLocated = message.locGot;
        unsubscribe(this.subscription);
    }
}