import { LightningElement, wire, track, api } from 'lwc';
// import getSchools from '@salesforce/apex/FindNearbySchools.getSchools';
import apiGetSchools from '@salesforce/apex/FindNearbySchools.apiGetSchools';

export default class ListSchools extends LightningElement {

    @track wiredSchools = [];
    @track schools = [];
    @api propertyId;
    showTable = false;

    // For displaying results by type
    elementaryLabel;
    elementaryCount = 0;
    elementarySelected = false;
    middleLabel;
    middleCount = 0;
    middleSelected = false;
    highLabel;
    highCount = 0;
    highSelected = false;
    privateLabel;
    privateCount = 0;
    privateSelected = false;
    universityLabel;
    universityCount = 0;
    universitySelected = false;
    noneSelected = true;

    @api
    get recordId() {
        return this.propertyId;
    }

    set recordId(propertyId) {
        this.propertyId = propertyId;
    }

    // For filtering and button handling
    schoolType;
    @track searchedSchools = [];

    // Get Schools from API
    @wire (apiGetSchools, {propId : "$propertyId"}) apiGetSchools(result) {
        this.wiredSchools = result;

        if (result.data) {
            this.schools = result.data;
            this.searchedSchools = [];
            // Only show component if there are 1 or more schools
            if (this.schools.length > 0) {
                this.showTable = true;
            }
            // Increment counters of each type of school
            for (let i = 0; i < this.schools.length; i++) {
                if (this.schools[i].Type__c == 'Elementary School') this.elementaryCount++;
                if (this.schools[i].Type__c == 'Middle School') this.middleCount++;
                if (this.schools[i].Type__c == 'High School') this.highCount++;
                if (this.schools[i].Type__c == 'Private School') this.privateCount++;
                if (this.schools[i].Type__c == 'University') this.universityCount++;
            }
            // Label results for buttons
            this.elementaryLabel = 'Elementary (' + this.elementaryCount + ')';
            this.middleLabel = 'Middle (' + this.middleCount + ')';
            this.highLabel = 'High (' + this.highCount + ')';
            this.privateLabel = 'Private (' + this.privateCount + ')';
            this.universityLabel = 'University (' + this.universityCount + ')';

            this.error = undefined;
        } else if (result.error) {
            this.error = result.error;
            this.schools = [];
        }
    }

    handleFilter(event) {
        // Get school type from button clicked
        this.searchedSchools = [];
        this.schoolType = event.target.value;
        this.noneSelected = false;

        // Flags for which button is selected
        this.elementarySelected = this.schoolType == 'Elementary School' ? true : false;
        this.middleSelected = this.schoolType == 'Middle School' ? true : false;
        this.highSelected = this.schoolType == 'High School' ? true : false;
        this.privateSelected = this.schoolType == 'Private School' ? true : false;
        this.universitySelected = this.schoolType == 'University' ? true : false;

        // Filter schools to that type
        for (let i = 0; i < this.schools.length; i++) {
            if (this.schoolType == this.schools[i].Type__c) {
                this.searchedSchools.push(this.schools[i]);
            }
        }
    }
    
    /* DEPRECATED: THIS COMPONENT WAS PREVIOUSLY AN INPUT FORM, AND THE
    // FUNCTIONALITY OF IT WAS SWITCHED TO A CLASS CALLED BY A TRIGGER
    curPostalCode;
    evtPostalCode;
    showTable = false;
    @track schools = [];
    @track error;

    // Postal code input field
    handlePostalCodeChange(event) {
        this.curPostalCode = event.target.value;
    }

    getNearbySchools() {
        // Shows table once button is clicked
        this.showTable = true;
        this.evtPostalCode = this.curPostalCode;
        
        // Apex method to get schools given postal code, using US Real Estate API
        getSchools({ postalCode: this.evtPostalCode })
        .then((result) => {
            this.schools = result;
            // console.log(this.schools.length);
            // for (let i = 0; i < this.schools.length; i++) {
            //     console.log(this.schools[i].name);
            // }
            this.error = undefined;
        })
        .catch((error) => {
            this.error = error;
            console.log(error.message);
            this.schools = undefined;
        });
    };
    */

}