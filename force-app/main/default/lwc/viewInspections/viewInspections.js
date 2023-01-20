import { LightningElement, api, wire, track } from 'lwc';
import getInspections from '@salesforce/apex/getProperties.getUpcomingInspections';

// Columns for datatable
const columns = [
    { label : 'Date', fieldName : 'Date', sortable : true, wrapText : false},
    { label : 'Time', fieldName : 'Time', sortable : false, wrapText : false},
    { label : 'Inspector', fieldName : 'Inspector', sortable : false, wrapText : true},
    { label : 'Subject', fieldName : 'Subject', sortable : false, wrapText : true},
];

export default class ViewInspections extends LightningElement {
    @track inspections = [];
    @track error;
    @api propertyId;

    // For columns and sorting
    columns = columns;
    defaultSort = 'asc';
    sortDirection = 'asc';
    sortedBy;
    hasInspections = false;

    @api
    get recordId() {
        return this.propertyId;
    }

    set recordId(propertyId) {
        this.propertyId = propertyId;
    }

    // Get upcoming inspections for property
    @wire (getInspections, {propId : "$propertyId"}) getInspections(result) {
        if (result.data) {
            // console.log("DATA FOUND");
            console.log(this.inspections.length);
            console.log(this.inspections[0]);
            console.log(this.propertyId);
            this.inspections = result.data.map((elem) => ({
                ...elem,
                ...{
                    'Id' : elem.Id,
                    'Property_Id' : elem.Property__c,
                    'Date' : elem.Date__c,
                    'Time' : elem.Time__c,
                    'Inspector' : elem.Inspector__r.Name,
                    'Subject' : elem.Subjects__c
                }
            }));

            if (this.inspections.length > 0) {
                console.log("RELEVANT DATA");
                this.hasInspections = true;
            }

            // Convert time data
            for (let i = 0; i < this.inspections.length; i++) {
                let timeFormatted = this.msToTime(this.inspections[i].Time);
                this.inspections[i].Time = timeFormatted;
            }

            this.error = undefined;
        } else if (result.error) {
            this.error = result.error;
            this.inspections = undefined;
        }
    }

    // Convert time from ms to hours and minutes
    msToTime(s) {
        let ms = s % 1000;
        s = (s - ms) / 1000;
        let secs = s % 60;
        s = (s - secs) / 60;
        let mins = s % 60;
        let hrs = (s - mins) / 60;
        hrs = hrs < 10 ? '0' + hrs : hrs;
        mins = mins < 10 ? '0' + mins : mins;
        let ampm = 'AM';
        // PM hours to match AM
        if (hrs >= 12) {
            ampm = 'PM';
        }
        // 12 AM
        if (hrs == 0) {
            hrs = 12;
        }
        // Display PM as AM
        if (hrs >= 13 && hrs <= 23) {
            hrs -= 12;
        }
        return hrs + ':' + mins + ' ' + ampm;
    }

    // Sorting by fields
    sortBy(field, reverse, primer) {
        const key = primer ? function (x) { return primer(x[field]); } : function (x) { return x[field]; };
        return function (a, b) {
            a= key(a);
            b = key(b);
            return reverse * ((a > b) - (b > a));
        };
    }

    // Handle sorting
    onHandleSort(event) {
        const { fieldName : sortedBy, sortDirection } = event.detail;
        const cloneData = [...this.inspections];
        
        cloneData.sort(this.sortBy(sortedBy, sortDirection === 'asc' ? 1 : -1));
        this.inspections = cloneData;
        this.sortDirection = sortDirection;
        this.sortedBy = sortedBy;
    }
}