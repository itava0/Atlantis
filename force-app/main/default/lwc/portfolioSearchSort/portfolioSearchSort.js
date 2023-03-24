import { LightningElement, track, api } from 'lwc';

export default class PortfolioSearchSort extends LightningElement {
    // For search and sort functionalities
    @api myProperties;
    searchKey;
    @track searchedProperties = [];
    @track sortedProperties = [];
    searchedPropertiesDist = [];
    amountFound;
    numToSort;
    sortText;
    curSort = "";
    ascending = true;
    nameSort = "brand-outline";
    ratingSort = "brand-outline";
    rentSort = "brand-outline";
    dateListedSort = "brand-outline";
    distanceSort = "brand-outline";

    // For user geolocation (for distance sorting; checks contact mailing & account billing, both of which Salesforce geocodes automatically)
    @api locationNotFound;
    @api userLat;
    @api userLon;
    distance;
    distances = [];
    propDistOrder;

    // Determine if sorting by distance is possible
    connectedCallback() {
        if (this.userLat == null & this.userLon == null) {
            this.locationNotFound = true;
        }
    }

    // Sends custom event back to parent component with updated information
    fireChangeEvent() {
        this.eventDetail = {
            searchedProperties: this.searchedProperties
        }

        const searchSort = new CustomEvent("searchsort", {
            detail: this.eventDetail
        });

        this.dispatchEvent(searchSort);
    }

    // Search function
    handleSearch(event) {
        this.searchKey = event.target.value;
        this.searchedProperties = [];
        this.amountFound = null;

        // Only update search if user has inputted 3 or more characters
        if (this.searchKey.length > 2) {
            this.amountFound = 0;
            for (let i = 0; i < this.myProperties.length; i++) {
                // For each property in portfolio, check if the search key can be found in name, record type, or an address field
                if (this.myProperties[i].Name.toLowerCase().includes(this.searchKey.toLowerCase())
                || this.myProperties[i].RecordType.Name.toLowerCase().includes(this.searchKey.toLowerCase())
                || this.myProperties[i].Billing_Street__c.toLowerCase().includes(this.searchKey.toLowerCase())
                || this.myProperties[i].Billing_City__c.toLowerCase().includes(this.searchKey.toLowerCase())
                || this.myProperties[i].Billing_State__c.toLowerCase().includes(this.searchKey.toLowerCase())
                || this.myProperties[i].Billing_Postal_Code__c.includes(this.searchKey)) {
                    // If found, add to the list of properties
                    this.searchedProperties.push(this.myProperties[i]);
                    this.amountFound++;
                }
            }
        } else {
            // For when user stops searching, go back to default and view all properties
            this.searchedProperties = this.myProperties;
            this.amountFound = null;
        }

        this.fireChangeEvent();
    }

    // Reset sort settings when new option clicked
    resetSort() {
        this.nameSort = "brand-outline";
        this.ratingSort = "brand-outline";
        this.rentSort = "brand-outline";
        this.dateListedSort = "brand-outline";
        this.distanceSort = "brand-outline";
    }

    // Clearing search and sorting back to default
    handleClear() {
        // Reset input field, and revert back to all properties
        this.searchKey = '';
        this.template.querySelectorAll("lightning-input").forEach((element) => {
            element.value = null;
        });
        this.searchedProperties = this.myProperties;
        this.curSort = "";
        this.ascending = true;
        this.amountFound = null;
        this.sortText = null;

        // Reset sorting conditions for all options
        this.resetSort();

        this.fireChangeEvent();
    }

    // Sort portfolio properties by a variety of parameters
    handleSort(event) {
        this.resetSort();
        this.searchedProperties = [...this.myProperties];
        if (this.curSort == event.target.value) this.ascending = !this.ascending;
        this.curSort = event.target.value;
        switch(event.target.value) {
            case "name":
                this.nameSort = "brand";
                this.searchedProperties.sort((a, b) => {
                    const nameA = a.Billing_Street__c.toLowerCase();
                    const nameB = b.Billing_Street__c.toLowerCase();
        
                    if (nameA < nameB) return -1;
                    else if (nameA > nameB) return 1;
                    else return 0;
                });
                if (!this.ascending) this.searchedProperties.reverse();
                this.sortText = this.ascending == true ? "Sorting by name (ascending)" : "Sorting by name (descending)";
                break;
            case "rating":
                this.ratingSort = "brand";
                this.searchedProperties.sort((a, b) => a.Score__c - b.Score__c);
                if (!this.ascending) this.searchedProperties.reverse();
                this.sortText = this.ascending == true ? "Sorting by rating (ascending)" : "Sorting by rating (descending)";
                break;
            case "rent":
                this.rentSort = "brand";
                this.searchedProperties.sort((a, b) => a.Rent__c - b.Rent__c);
                if (!this.ascending) this.searchedProperties.reverse();
                this.sortText = this.ascending == true ? "Sorting by rent (ascending)" : "Sorting by rent (descending)";
                break;
            case "datelisted":
                this.dateListedSort = "brand";
                this.searchedProperties.sort((a, b) => a.Days_On_Market__c - b.Days_On_Market__c);
                if (!this.ascending) this.searchedProperties.reverse();
                this.sortText = this.ascending == true ? "Sorting by date listed (ascending)" : "Sorting by date listed (descending)";
                break;
            case "distance":
                this.distanceSort = "brand";
                this.sortDistances();
                this.sortText = this.ascending == true ? "Sorting by distance from your address (ascending)" : "Sorting by distance from your address (descending)";
                break;
            default:
                // default
        }

        this.fireChangeEvent();
    }

    // Sorting properties by distance from user (separate method due to its unique properties and functionalities)
    sortDistances() {
        // Create new array of distance objects, including property Id and the distance from the property
        // (Has to be done this way since you can't add a hypothetical "userDistance" key-value pair for objects that have been received from Apex)
        this.distances = [];
        for (let i = 0; i < this.searchedProperties.length; i++) {
            this.distance = this.calculateDistance(this.userLat, this.userLon, this.searchedProperties[i].Geolocation__Latitude__s, this.searchedProperties[i].Geolocation__Longitude__s);
            this.distances.push({
                "id": this.searchedProperties[i].Id,
                "distance": this.distance
            });
        }

        this.distances.sort((a, b) => a.distance - b.distance);

        // Alternate between ascending and descending
        if (!this.ascending) this.distances.reverse();

        // Using the distance array as a reference, reorder the portfolio properties by distance, using lat & lon to match the two arrays
        this.propDistOrder = 0;
        this.searchedPropertiesDist = [];
        while (this.propDistOrder < this.searchedProperties.length) {
            for (let i = 0; i < this.searchedProperties.length; i++) {
                if (this.distances[this.propDistOrder]) {
                    if (this.searchedProperties[i].Id == this.distances[this.propDistOrder].id) {
                        this.searchedPropertiesDist.push(this.searchedProperties[i]);
                        this.propDistOrder++;
                    }
                }
            }
        }
        this.searchedProperties = this.searchedPropertiesDist;
    }
    
    // Calculate distance using Haversine formula
    calculateDistance (lat1, lon1, lat2, lon2) {
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
}