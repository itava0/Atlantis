import { LightningElement, wire, track } from 'lwc';
import getContact from '@salesforce/apex/getProperties.getContactFromUser';
import getAccount from '@salesforce/apex/getProperties.getAccountFromContact';
import getRecordType from '@salesforce/apex/getProperties.getTypeFromAccount';
import getPropertyOwners from '@salesforce/apex/getProperties.getPropertyOwnersFromAccount';
import getProperties from '@salesforce/apex/getProperties.getPortfolioProperties';
import USER_ID from '@salesforce/user/Id';

// Property Owner record types IDs; first is person account, second is standard account
const PROPERTY_OWNER_ID = '012Dn000000gsCuIAI';
const PROPERTY_OWNER_ID_2 = '012Dn000000giXgIAI';

export default class PortfolioProperties extends LightningElement {
    // Wired query information
    @track wiredProperties = [];
    @track properties = [];
    @track error;
    @track wiredUsers = [];
    @track users = [];
    @track wiredContacts = [];
    @track contacts = [];
    @track wiredAccounts = [];
    @track accounts = [];
    @track wiredPropertyOwners = [];
    @track propertyOwners = [];

    // Results from wired queries
    @track userId = USER_ID;
    @track contactId;
    @track accountId;
    @track recordTypeId;
    @track propertyOwnerIds = [];
    @track propertyIds = [];

    // User and property information
    @track myProperties = [];
    isPropertyOwner = false;
    userFirstName;
    userLastName;
    numProperties = 0;
    oneProperty = false;

    // For search and sort functionalities
    searchKey;
    @track searchedProperties = [];
    @track sortedProperties = [];
    searchedPropertiesDist = [];
    amountFound;
    numToSort;
    sortText;
    sortingName = false;
    sortingRating = false;
    sortingRent = false;
    // sortingMarketPrice = false;
    sortingDaysOnMarket = false;
    sortingDistance = false;
    ascendingName = false;
    ascendingRating = false;
    ascendingRent = false;
    // ascendingMarketPrice = false;
    ascendingDaysOnMarket = false;
    ascendingDistance = false;

    // For user geolocation (for distance sorting; checks contact mailing & account billing, both of which Salesforce geocodes automatically)
    userLat;
    userLon;
    distance;
    distances = [];
    propDistOrder;
    locationFound = false;

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
    }

    // Clearing search and sorting back to default
    handleClear() {
        // Reset input field, and revert back to all properties
        this.searchKey = '';
        this.template.querySelectorAll("lightning-input").forEach((element) => {
            element.value = null;
        });
        this.searchedProperties = this.myProperties;
        this.amountFound = null;
        this.sortText = null;

        // Reset sorting conditions for all options
        this.sortingName = false;
        this.sortingRating = false;
        this.sortingRent = false;
        // this.sortingMarketPrice = false;
        this.sortingDaysOnMarket = false;
        this.sortingDistance = false;
        this.ascendingName = false;
        this.ascendingRating = false;
        this.ascendingRent = false;
        // this.ascendingMarketPrice = false;
        this.ascendingDaysOnMarket = false;
        this.ascendingDistance = false;
    }

    // Sorting properties by name
    handleSortName() {
        this.sortingName = true;
        this.searchedProperties.sort((a, b) => {
            const nameA = a.Name.toLowerCase();
            const nameB = b.Name.toLowerCase();

            if (nameA < nameB) {
                return -1;
            } else if (nameA > nameB) {
                return 1;
            } else {
                return 0;
            }
        });

        // Alternate between ascending and descending
        this.ascendingName = !this.ascendingName;
        if (!this.ascendingName) {
            this.searchedProperties.reverse();
            this.sortText = 'Sorting by Name, in descending order';
        } else {
            this.sortText = 'Sorting by Name, in ascending order';
        }

        // Reset sorting condition for other options
        this.sortingRating = false;
        this.sortingRent = false;
        // this.sortingMarketPrice = false;
        this.sortingDaysOnMarket = false;
        this.sortingDistance = false;
        this.ascendingRating = false;
        this.ascendingRent = false;
        // this.ascendingMarketPrice = false;
        this.ascendingDaysOnMarket = false;
        this.ascendingDistance = false;
    }

    // Sorting properties by rating
    handleSortRating() {
        this.sortingRating = true;
        this.searchedProperties.sort((a, b) => a.Score__c - b.Score__c);

        // Alternate between ascending and descending
        this.ascendingRating = !this.ascendingRating;
        if (!this.ascendingRating) {
            this.searchedProperties.reverse();
            this.sortText = 'Sorting by Rating, in descending order';
        } else {
            this.sortText = 'Sorting by Rating, in ascending order';
        }

        // Reset sorting condition for other options
        this.sortingName = false;
        this.sortingRent = false;
        // this.sortingMarketPrice = false;
        this.sortingDaysOnMarket = false;
        this.sortingDistance = false;
        this.ascendingName = false;
        this.ascendingRent = false;
        // this.ascendingMarketPrice = false;
        this.ascendingDaysOnMarket = false;
        this.ascendingDistance = false;
    }

    // Sorting properties by rent
    handleSortRent() {
        this.sortingRent = true;
        this.searchedProperties.sort((a, b) => a.Rent__c - b.Rent__c);

        // Alternate between ascending and descending
        this.ascendingRent = !this.ascendingRent;
        if (!this.ascendingRent) {
            this.searchedProperties.reverse();
            this.sortText = 'Sorting by Rent, in descending order';
        } else {
            this.sortText = 'Sorting by Rent, in ascending order';
        }

        // Reset sorting condition for other options
        this.sortingName = false;
        this.sortingRating = false;
        // this.sortingMarketPrice = false;
        this.sortingDaysOnMarket = false;
        this.sortingDistance = false;
        this.ascendingName = false;
        this.ascendingRating = false;
        // this.ascendingMarketPrice = false;
        this.ascendingDaysOnMarket = false;
        this.ascendingDistance = false;
    }

    // Sorting properties by market price
    /*
    handleSortMarketPrice() {
        this.sortingMarketPrice = true;
        this.searchedProperties.sort((a, b) => a.Market_Price__c - b.Market_Price__c);

        // Alternate between ascending and descending
        this.ascendingMarketPrice = !this.ascendingMarketPrice;
        if (!this.ascendingMarketPrice) {
            this.searchedProperties.reverse();
            this.sortText = 'Sorting by Market Price, in descending order';
        } else {
            this.sortText = 'Sorting by Market Price, in ascending order';
        }
        
        // Reset sorting condition for other options
        this.sortingName = false;
        this.sortingRating = false;
        this.sortingRent = false;
        this.sortingDaysOnMarket = false;
        this.sortingDistance = false;
        this.ascendingName = false;
        this.ascendingRating = false;
        this.ascendingRent = false;
        this.ascendingDaysOnMarket = false;
        this.ascendingDistance = false;
    }
    */

    // Sorting properties by days on market
    handleSortDateListed() {
        this.sortingDaysOnMarket = true;
        this.searchedProperties.sort((a, b) => a.Days_On_Market__c - b.Days_On_Market__c);

        // Alternate between ascending and descending
        this.ascendingDaysOnMarket = !this.ascendingDaysOnMarket;
        if (!this.ascendingDaysOnMarket) {
            this.searchedProperties.reverse();
            this.sortText = 'Sorting by Date Listed, in ascending order';
        } else {
            this.sortText = 'Sorting by Date Listed, in descending order';
        }

        // Reset sorting condition for other options
        this.sortingName = false;
        this.sortingRating = false;
        this.sortingRent = false;
        // this.sortingMarketPrice = false;
        this.sortingDistance = false;
        this.ascendingName = false;
        this.ascendingRating = false;
        this.ascendingRent = false;
        // this.ascendingMarketPrice = false;
        this.ascendingDistance = false;
    }

    // Sorting properties by distance from user
    handleSortDistance() {
        this.sortingDistance = true;
        // Create new array of distance objects, including geolocation and the distance from the property
        // (Has to be done this way since you can't add a hypothetical "userDistance" key-value pair for objects that have been received from Apex)
        // console.log("USER ", this.userLat, this.userLon);
        this.distances = [];
        for (let i = 0; i < this.searchedProperties.length; i++) {
            this.distance = this.calculateDistance(this.userLat, this.userLon, this.searchedProperties[i].Geolocation__Latitude__s, this.searchedProperties[i].Geolocation__Longitude__s);
            this.distances.push({
                'lat': this.searchedProperties[i].Geolocation__Latitude__s,
                'lon': this.searchedProperties[i].Geolocation__Longitude__s,
                'distance': this.distance
            });
            // console.log(this.distances[i]);
        }

        this.distances.sort((a, b) => a.distance - b.distance);

        // Alternate between ascending and descending
        this.ascendingDistance = !this.ascendingDistance;
        if (!this.ascendingDistance) {
            this.distances.reverse();
            this.sortText = 'Sorting by Distance, in descending order';
        } else {
            this.sortText = 'Sorting by Distance, in ascending order';
        }

        // Using the distance array as a reference, reorder the portfolio properties by distance, using lat & lon to match the two arrays
        this.propDistOrder = 0;
        this.searchedPropertiesDist = [];
        while (this.propDistOrder < this.searchedProperties.length) {
            for (let i = 0; i < this.searchedProperties.length; i++) {
                if (this.distances[this.propDistOrder]) {
                    if (this.searchedProperties[i].Geolocation__Latitude__s == this.distances[this.propDistOrder].lat &&
                        this.searchedProperties[i].Geolocation__Longitude__s == this.distances[this.propDistOrder].lon) {
                            this.searchedPropertiesDist.push(this.searchedProperties[i]);
                            this.propDistOrder++;
                        }
                }
            }
        }
        this.searchedProperties = this.searchedPropertiesDist;

        // Reset sorting condition for other options
        this.sortingName = false;
        this.sortingRating = false;
        this.sortingRent = false;
        // this.sortingMarketPrice = false;
        this.sortingDaysOnMarket = false;
        this.ascendingName = false;
        this.ascendingRating = false;
        this.ascendingRent = false;
        // this.ascendingMarketPrice = false;
        this.ascendingDaysOnMarket = false;
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

    // Get Contact ID from User
    @wire (getContact, {usrId : "$userId"}) getContact(result) {
        this.wiredUsers = result;
        if (result.data) {
            this.users = result.data;
            console.log("USERID", this.userId);
            console.log("CONTACTID", this.users[0].ContactId);
            this.contactId = this.users[0].ContactId;
            this.error = undefined;
        } else if (result.error) {
            this.error = result.error;
            this.users = [];
        }
    }

    // Get Account ID, Name, and Address Info from Contact
    @wire (getAccount, {conId : "$contactId"}) getAccount(result) {
        this.wiredContacts = result;

        if (result.data) {
            this.contacts = result.data;
            console.log("ACCOUNTID", this.contacts[0].AccountId);
            console.log("NAME", this.contacts[0].FirstName, this.contacts[0].LastName);
            console.log("CONTACT GEO", this.contacts[0].MailingLatitude, this.contacts[0].MailingLongitude);
            this.accountId = this.contacts[0].AccountId;
            this.userFirstName = this.contacts[0].FirstName;
            this.userLastName = this.contacts[0].LastName;
            if (!this.userLat) this.userLat = this.contacts[0].MailingLatitude;
            if (!this.userLon) this.userLon = this.contacts[0].MailingLongitude;
            this.error = undefined;
        } else if (result.error) {
            this.error = result.error;
            this.contacts = [];
        }
    }

    // Get Record Type ID and Address Info from Account
    @wire (getRecordType, {accId : "$accountId"}) getRecordType(result) {
        this.wiredAccounts = result;

        if (result.data) {
            this.accounts = result.data;
            console.log("RECORDTYPEID", this.accounts[0].RecordTypeId);
            console.log("ACCOUNT GEO", this.accounts[0].BillingLatitude, this.accounts[0].BillingLongitude);
            this.recordTypeId = this.accounts[0].RecordTypeId;
            if (this.recordTypeId == PROPERTY_OWNER_ID || this.recordTypeId == PROPERTY_OWNER_ID_2) {
                this.isPropertyOwner=true;
            }
            if (!this.userLat) this.userLat = this.accounts[0].BillingLatitude;
            if (!this.userLon) this.userLon = this.accounts[0].BillingLongitude;
            if (this.userLat && this.userLon) {
                this.locationFound = true;
            }
            console.log("LOCATION?", this.locationFound);
            this.error = undefined;
        } else if (result.error) {
            this.error = result.error;
            this.accounts = [];
        }
    }

    // Get Property Owners from Account
    @wire (getPropertyOwners, {accId : "$accountId"}) getPropertyOwners(result) {
        this.wiredPropertyOwners = result;

        if (result.data) {
            this.propertyOwners = result.data;
            this.propertyOwnerIds = [];
            if (this.propertyOwners.length > 0) {
                for (let i = 0; i < this.propertyOwners.length; i++) {
                    console.log("PROPERTYOWNER", i, this.propertyOwners[i].Id);
                    console.log("PROPERTY", i, this.propertyOwners[i].Property__c);
                    this.propertyOwnerIds.push(this.propertyOwners[i].Id);
                    this.propertyIds.push(this.propertyOwners[i].Property__c);
                }
            }
            this.error = undefined;
        } else if (result.error) {
            this.error = result.error;
            this.propertyOwners = [];
        }
    }

    // Fetch Property Records
    @wire (getProperties, {propOwnerIds : "$propertyOwnerIds"}) getProperties(result) {
        this.wiredProperties = result;
        if (result.data) {
            this.properties = result.data;
            if (this.properties.length > 0) {
                for (let i = 0; i < this.properties.length; i++) {
                    for (let j = 0; j < this.propertyOwners.length; j++) {
                        if (this.properties[i].Id == this.propertyOwners[j].Property__c) {
                            // If a property is found belonging to property owner, add it to the list
                            this.numProperties++;
                            if (this.numProperties == 1) {
                                this.oneProperty = true;
                            } else {
                                this.oneProperty = false;
                            }
                            this.myProperties.push(this.properties[i]);
                            this.searchedProperties.push(this.properties[i]);
                        }
                    }
                }
                for (let k = 0; k < this.myProperties.length; k++) {
                    // console.log("NEW RESULT", k + 1, this.myProperties[k].Billing_Street__c, this.myProperties[k].Billing_City__c)
                }
            }
            this.error = undefined;
        } else if (result.error) {
            this.error = result.error;
        }
    }

}