import { LightningElement, wire, track, api } from "lwc";
import { publish, MessageContext, subscribe, unsubscribe } from "lightning/messageService";
import { refreshApex } from "@salesforce/apex";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import FILTERSCHANGEMC from "@salesforce/messageChannel/FiltersChange__c";
import GOTUSERLOCATIONMC from "@salesforce/messageChannel/GotUserLocation__c";
import MAPGRIDSWAPMC from "@salesforce/messageChannel/MapGridSwap__c";
import geocodeDistance from "@salesforce/apex/PropertyGeocode.geocodeAddressForDistance";
import getAddresses from "@salesforce/apex/getAddresses.getAddressInfo";

const DELAY = 350;

export default class PropertyFilterDistance extends LightningElement {

    @api properties;
    @track error;
    pageNumber = 1;
    subscription;
    @track eventDetail;
    @track propsInDistance;
    distance;
    addressLat;
    addressLon;
    maxDistance;
    belowAll;

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
    

    // Updating street in distance calculator
    handleStreetChange(event) {
        this.curStreet = event.target.value;
    }

    // Updating city in distance calculator
    handleCityChange(event) {
        this.curCity = event.target.value;
    }

    // Updating state in distance calculator
    handleStateChange(event) {
        this.curState = event.target.value;
    }

    // Updating postal code in distance calculator
    handlePostalCodeChange(event) {
        this.curPostalCode = event.target.value;
    }

    // Updating max distance in distance calculator
    handleDistanceChange(event) {
        this.curDistance = event.target.value;
    }

    // Get distance
    getDistance() {
        if (this.curStreet != this.evtStreet || this.curCity != this.evtCity || this.curState != this.evtState || this.curPostalCode != this.evtPostalCode) {
            // Store user-inputted address information, to avoid repeated API calls if no changes have been made
            this.evtStreet = this.curStreet;
            this.evtCity = this.curCity;
            this.evtState = this.curState;
            this.evtPostalCode = this.curPostalCode;
            this.evtDistance = this.curDistance;

            // Geocode address using an Apex code (no longer needs to be stored in separate Address record)
            geocodeDistance({ iStreet: this.evtStreet, iCity: this.evtCity, iState: this.evtState, iPostalCode: this.evtPostalCode })
            .then((result) => {
                // Store returned latitude and longitude, as well as user's inputted distance
                this.addressLat = result.lat;
                this.addressLon = result.lon;

                // For each property, calculate distance
                this.getPropertyDistances(this.addressLat, this.addressLon, this.evtDistance);
            })
            .catch((error) => {
                this.error = error;
                console.log("ERROR: ", this.error.message);
            });
        } else {
            // If the address information is identical, re-calculate without the need to call API
            this.evtDistance = this.curDistance;
            this.getPropertyDistances(this.addressLat, this.addressLon, this.evtDistance);
        }
    }

    // For each property, calculate distance using lat & lon of each property combined with lat & lon of the given address
    getPropertyDistances(addressLat, addressLon, distance) {
        this.propsInDistance = [];
        let maxDistance = parseFloat(distance);
        this.belowAll = true;

        // If property is within distance, add to array of Ids to be sent back to parent
        for (let i = 0; i < this.properties.length; i++) {
            this.distance = this.calculateDistance(addressLat, addressLon, this.properties[i].Geolocation__Latitude__s, this.properties[i].Geolocation__Longitude__s);
            // console.log(addressLat, addressLon, this.properties[i].Geolocation__Latitude__s, this.properties[i].Geolocation__Longitude__s);
            // console.log(this.properties[i].Billing_Street__c, this.distance, maxDistance);
            if (this.distance < maxDistance) {
                this.belowAll = false;
                this.propsInDistance.push(this.properties[i].Id);
            }
        }

        // Using an Id we are not using, handles an edge case where filters don't update properly if the inputted address is below every retrieved distance
        if (this.belowAll) {
            this.propsInDistance.push('a02Dn000001H5RtIAK');
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
        this.eventDetail = {
            propsInDistance: this.propsInDistance,
            pageNumber: this.pageNumber
        }

        const updatedDistance = new CustomEvent("distanceupdate", {
            detail: this.eventDetail
        });

        this.dispatchEvent(updatedDistance);
    }

    @wire(MessageContext)
    messageContext;

    // Subscribe to message channel
    connectedCallback() {
        // Subscription Message channel to update filters again if user switches between map and grid
        this.subscription = subscribe(
        this.messageContext,
        MAPGRIDSWAPMC,
        () => {
            this.fireChangeEvent();
        }
        );
    }

    // Unsubscribe from message channel
    disconnectedCallback() {
        unsubscribe(this.subscription);
        this.subscription = null;
    }

    // Options for state picklist
    stateOptions = [
        { label: "Alabama", value: "Alabama" },
        { label: "Alaska", value: "Alaska" },
        { label: "Arizona", value: "Arizona" },
        { label: "Arkansas", value: "Arkansas" },
        { label: "California", value: "California" },
        { label: "Colorado", value: "Colorado" },
        { label: "Connecticut", value: "Connecticut" },
        { label: "Delaware", value: "Delaware" },
        { label: "District of Columbia", value: "District of Columbia" },
        { label: "Florida", value: "Florida" },
        { label: "Georgia", value: "Georgia" },
        { label: "Hawaii", value: "Hawaii" },
        { label: "Idaho", value: "Idaho" },
        { label: "Illinois", value: "Illinois" },
        { label: "Indiana", value: "Indiana" },
        { label: "Iowa", value: "Iowa" },
        { label: "Kansas", value: "Kansas" },
        { label: "Kentucky", value: "Kentucky" },
        { label: "Louisiana", value: "Louisiana" },
        { label: "Maine", value: "Maine" },
        { label: "Maryland", value: "Maryland" },
        { label: "Massachusetts", value: "Massachusetts" },
        { label: "Michigan", value: "Michigan" },
        { label: "Minnesota", value: "Minnesota" },
        { label: "Mississippi", value: "Mississippi" },
        { label: "Missouri", value: "Missouri" },
        { label: "Montana", value: "Montana" },
        { label: "Nebraska", value: "Nebraska" },
        { label: "Nevada", value: "Nevada" },
        { label: "New Hampshire", value: "New Hampshire" },
        { label: "New Jersey", value: "New Jersey" },
        { label: "New Mexico", value: "New Mexico" },
        { label: "New York", value: "New York" },
        { label: "North Carolina", value: "North Carolina" },
        { label: "North Dakota", value: "North Dakota" },
        { label: "Ohio", value: "Ohio" },
        { label: "Oklahoma", value: "Oklahoma" },
        { label: "Oregon", value: "Oregon" },
        { label: "Pennsylvania", value: "Pennsylvania" },
        { label: "Rhode Island", value: "Rhode Island" },
        { label: "South Carolina", value: "South Carolina" },
        { label: "South Dakota", value: "South Dakota" },
        { label: "Tennessee", value: "Tennessee" },
        { label: "Texas", value: "Texas" },
        { label: "Utah", value: "Utah" },
        { label: "Vermont", value: "Vermont" },
        { label: "Virginia", value: "Virginia" },
        { label: "Washington", value: "Washington" },
        { label: "West Virginia", value: "West Virginia" },
        { label: "Wisconsin", value: "Wisconsin" },
        { label: "Wyoming", value: "Wyoming" }
    ];

    /*
    // OLD CODE - attempting to rewrite this component but leaving original up as reference / in case of reverting
    // First I'll rework the distance calculator functionality, after that I'll try to reimplement Gage's location features as well

    // Variables handled by filters and list map
    subscription;
    subscription2;
    pageNumber = 1;
    userLatitude = 0;
    userLongitude = 0;
    userLocated = false;
    useCurrentLocation = false;

    // Stores address location (cur = inputted value, evt = sent to API)
    curStreet;
    curCity;
    curState = "GA";
    curPostalCode;
    curDistance;
    evtStreet;
    evtCity;
    evtState = "GA";
    evtPostalCode;
    evtDistance;
    geocoded = false;

    // Values from @wire and @api
    @track wiredAddresses = [];
    @track addresses = [];
    @api properties;
    @track error;

    // For calculating distance
    distances = [];
    streets = [];
    cities = [];
    streetsAll = [];
    citiesAll = [];
    distance;
    belowAll;
    lat1;
    lon1;
    lat2;
    lon2;

    // Options for state picklist
    stateOptions = [
        { label: "Alabama", value: "AL" },
        { label: "Alaska", value: "AK" },
        { label: "Arizona", value: "AZ" },
        { label: "Arkansas", value: "AR" },
        { label: "California", value: "CA" },
        { label: "Colorado", value: "CO" },
        { label: "Connecticut", value: "CT" },
        { label: "Delaware", value: "DE" },
        { label: "District of Columbia", value: "DC" },
        { label: "Florida", value: "FL" },
        { label: "Georgia", value: "GA" },
        { label: "Hawaii", value: "HI" },
        { label: "Idaho", value: "ID" },
        { label: "Illinois", value: "IL" },
        { label: "Indiana", value: "IN" },
        { label: "Iowa", value: "IA" },
        { label: "Kansas", value: "KS" },
        { label: "Kentucky", value: "KY" },
        { label: "Louisiana", value: "LA" },
        { label: "Maine", value: "ME" },
        { label: "Maryland", value: "MD" },
        { label: "Massachusetts", value: "MA" },
        { label: "Michigan", value: "MI" },
        { label: "Minnesota", value: "MN" },
        { label: "Mississippi", value: "MS" },
        { label: "Missouri", value: "MO" },
        { label: "Montana", value: "MT" },
        { label: "Nebraska", value: "NE" },
        { label: "Nevada", value: "NV" },
        { label: "New Hampshire", value: "NH" },
        { label: "New Jersey", value: "NJ" },
        { label: "New Mexico", value: "NM" },
        { label: "New York", value: "NY" },
        { label: "North Carolina", value: "NC" },
        { label: "North Dakota", value: "ND" },
        { label: "Ohio", value: "OH" },
        { label: "Oklahoma", value: "OK" },
        { label: "Oregon", value: "OR" },
        { label: "Pennsylvania", value: "PA" },
        { label: "Rhode Island", value: "RI" },
        { label: "South Carolina", value: "SC" },
        { label: "South Dakota", value: "SD" },
        { label: "Tennessee", value: "TN" },
        { label: "Texas", value: "TX" },
        { label: "Utah", value: "UT" },
        { label: "Vermont", value: "VT" },
        { label: "Virginia", value: "VA" },
        { label: "Washington", value: "WA" },
        { label: "West Virginia", value: "WV" },
        { label: "Wisconsin", value: "WI" },
        { label: "Wyoming", value: "WY" }
    ];

    @wire(MessageContext)
    messageContext;

    // Reset filters
    handleReset() {
        this.template.querySelectorAll("lightning-input").forEach((element) => {
            element.value = null;
        });
        this.streets = [];
        this.cities = [];
        this.pageNumber = 1;
        this.companies = ["Atlantis"];
    }

    // Filter Update: Current Location
    handleUseCurrentLocationChange(event) {
        this.useCurrentLocation = event.target.checked;
    }

    // Get user location
    handleMessage(message) {
        const toastEvt = new ShowToastEvent({
        title: "Geocoded your location",
        message: "Use the checkbox to get property distance from your current location",
        variant: "success"
        });
        this.dispatchEvent(toastEvt);
        this.userLocated = true;
        this.userLatitude = message.latitude;
        this.userLongitude = message.longitude;
        unsubscribe(this.subscription);
    }

    // Subscribe to message channel
    connectedCallback() {
        // Subscription 1: User location message channel
        this.subscription = subscribe(
        this.messageContext,
        GOTUSERLOCATIONMC,
        (message) => {
            this.handleMessage(message);
        }
        );
        // Subscription 2: Message channel to update filters again if user switches between map and grid
        this.subscription2 = subscribe(
        this.messageContext,
        MAPGRIDSWAPMC,
        () => {
            this.fireChangeEvent();
        }
        );
    }

    // Unsubscribe from message channel
    disconnectedCallback() {
        unsubscribe(this.subscription2);
        this.subscription2 = null;
    }

    // Calls message channel to update other components
    fireChangeEvent() {
        // Debouncing this method: Do not actually fire the event as long as this function is
        // being called within a delay of DELAY. This is to avoid a very large number of Apex
        // method calls in components listening to this event.
        window.clearTimeout(this.delayTimeout);

        // Sends variables, primarily for filters, through message channel
        this.delayTimeout = setTimeout(() => {
        const filters = {
            streets: this.streets,
            cities: this.cities,
            distance: this.curDistance,
            latitude: this.lat1,
            longitude: this.lon1,
            pageNumber: this.pageNumber
        };
        publish(this.messageContext, FILTERSCHANGEMC, filters);
        }, DELAY);
    }

    // Get geo of inputted address
    geoAddress() {
        this.evtStreet = this.curStreet;
        this.evtCity = this.curCity;
        this.evtState = this.curState;
        this.evtPostalCode = this.curPostalCode;

        // Apex method which geocodes property from inputted address information
        doAddressGeocodeInput({ iStreet: this.evtStreet, iCity: this.evtCity, iState: this.evtState, iPostalCode: this.evtPostalCode })
        .then(() => {
        if (this.evtStreet && this.evtCity && this.evtState && this.evtPostalCode) {
            const toastEvt = new ShowToastEvent({
            title: "Address geocoded",
            variant: "success"
            });
            this.dispatchEvent(toastEvt);
        }

        refreshApex(this.wiredAddresses);

        this.geocoded = true;
        })
        .catch((error) => {
        console.log(error.message);
        });
    }

    // Gets distance for each property from the given location
    getDistance() {
        refreshApex(this.wiredAddresses);

        // Geocodes address if values have changed (allows users to resubmit without refreshing)
        if (
        (this.curStreet !== this.evtStreet || this.curCity !== this.evtCity || this.curState !== this.evtState ||
        this.curPostalCode !== this.evtPostalCode) && this.useCurrentLocation === false) {
        this.geocoded = false;
        }

        // Only called when geocoding is required (prevents need for two separate buttons)
        if (!this.geocoded) {
        this.geoAddress();
        }

        this.evtDistance = this.curDistance;
        this.streets = [];
        this.cities = [];
        this.distances = [];
        this.belowAll = true;

        // Check Addresses and If Match, Calculate Distance
        for (let i = 0; i < 5; i++) {
        if (this.addresses[i] != null && this.addresses[i].Latitude__c != null && this.addresses[i].Longitude__c != null && !this.useCurrentLocation) {
            if (this.addresses[i].Street__c === this.evtStreet && this.addresses[i].City__c === this.evtCity &&
            this.addresses[i].State__c === this.evtState && this.addresses[i].PostalCode__c === this.evtPostalCode) {
            // First set of geocoordinates grabbed from inputted address (saved in Address object)
            this.lat1 = this.addresses[i].Latitude__c;
            this.lon1 = this.addresses[i].Longitude__c;
            for (let j = 0; j < this.properties.length; j++) {
                // For each property, second set of geocoordinates grabbed from property's fields
                this.lat2 = this.properties[j].Geolocation__Latitude__s;
                this.lon2 = this.properties[j].Geolocation__Longitude__s;
                // Calculates the distance given these coordinates
                this.distance = this.calculateDistance(this.lat1, this.lon1, this.lat2, this.lon2);
                // Pushes street & city info with distance at matching indexes, so the property can be connected to the acquired distance
                this.streetsAll.push(this.properties[j].Billing_Street__c);
                this.citiesAll.push(this.properties[j].Billing_City__c);
                this.distances.push(this.distance);
            }
            }
        } else if(this.useCurrentLocation) {
            // Same as above, but using current location data instead of inputted information
            this.lat1 = this.userLatitude;
            this.lon1 = this.userLongitude;
            for (let j = 0; j < this.properties.length; j++) {
            this.lat2 = this.properties[j].Geolocation__Latitude__s;
            this.lon2 = this.properties[j].Geolocation__Longitude__s;
            this.distance = this.calculateDistance(this.lat1, this.lon1, this.lat2, this.lon2);
            this.streetsAll.push(this.properties[j].Billing_Street__c);
            this.citiesAll.push(this.properties[j].Billing_City__c);
            this.distances.push(this.distance);
            }
        }
        else {
            console.log("No matching geocoded address found.");
        }
        }

        // Filter Out Properties That Exceed Max Distance
        if (this.distances.length > 0) {
        for (let k = 0; k < this.properties.length; k++) {
            if (this.distances[k] <= this.evtDistance) {
            this.belowAll = false;
            // New arrays that will be pushed to the filters, used in SOQL queries to only return the matching addresses for filter results
            this.streets.push(this.properties[k].Billing_Street__c);
            this.cities.push(this.properties[k].Billing_City__c);
            }
        }
        // Handles an edge case where filters don't update properly if the inputted address is below every retrieved distance
        if (this.belowAll) {
            this.streets.push("Not a Real Address");
            this.cities.push("Not a Real City");
        }
        } else {
        // Message user that address data is still being processed by API
        const toastEvt = new ShowToastEvent({
            title: "No address data found",
            message: "You may need to wait a few seconds.",
            variant: "warning"
        });
        this.dispatchEvent(toastEvt);
        }

        this.fireChangeEvent();
    }

    // Fetch Address Records
    @wire(getAddresses) getAddresses(result) {
        this.wiredAddresses = result;

        if (result.data) {
        this.addresses = result.data;
        this.error = undefined;
        } else if (result.error) {
        this.error = result.error;
        this.addresses = [];
        }
    }

    calculateDistance(lat1, lon1, lat2, lon2) {
        // Earth's radius in kilometers
        const R = 6371;
    
        // Convert latitude and longitude values from degrees to radians
        const dLat = (lat2 - lat1) * (Math.PI / 180);
        const dLon = (lon2 - lon1) * (Math.PI / 180);
        lat1 = lat1 * (Math.PI / 180);
        lat2 = lat2 * (Math.PI / 180);
    
        // Apply the Haversine formula to calculate the distance between the two points
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const d = R * c;
    
        // Return the distance in miles
        return d * 0.621371192;
    }

    // Updating street in distance calculator
    handleStreetChange(event) {
        this.curStreet = event.target.value;
    }

    // Updating city in distance calculator
    handleCityChange(event) {
        this.curCity = event.target.value;
    }

    // Updating state in distance calculator
    handleStateChange(event) {
        this.curState = event.target.value;
    }

    // Updating postal code in distance calculator
    handlePostalCodeChange(event) {
        this.curPostalCode = event.target.value;
    }

    // Updating max distance in distance calculator
    handleDistanceChange(event) {
        this.curDistance = event.target.value;
    }
    */
}