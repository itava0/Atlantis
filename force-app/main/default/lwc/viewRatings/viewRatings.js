import { LightningElement, api, wire, track } from 'lwc';
import PROPERTY_OBJECT from "@salesforce/schema/Property__c";
import OVERALL_RATING_FIELD from "@salesforce/schema/Property__c.Rating__c";
import getRatings from '@salesforce/apex/getProperties.getPropertyRatings';

// Columns for datatable
const columns = [
    { label : 'User', fieldName : 'User_Name', sortable : true, wrapText : false},
    { label : 'Score', fieldName : 'Score', sortable : true, wrapText : false},
    { label : 'Review', fieldName : 'Review', sortable : true, wrapText : true}
];

export default class ViewRatings extends LightningElement {

    // For tracking rating
    @track ratings = [];
    @track error;
    @api propertyId;
    propertyObj = PROPERTY_OBJECT;
    overallRating = OVERALL_RATING_FIELD;
    hasRating = false;
    
    // For columns and sorting
    columns = columns;
    defaultSort = 'desc';
    sortDirection = 'desc';
    sortedBy;

    @api
    get recordId() {
        return this.propertyId;
    }

    set recordId(propertyId) {
        this.propertyId = propertyId;
    }

    // Get ratings for property
    @wire (getRatings, {propId : "$propertyId"}) getRatings(result) {
        if (result.data) {
            this.ratings = result.data.map((elem) => ({
                ...elem,
                ...{
                    'Rating_Id' : elem.Id,
                    'User_Id' : elem.User__c,
                    'Property_Id' : elem.Property__c,
                    'User_Name' : elem.User__r.Name,
                    'Score' : elem.Score__c,
                    'Review' : elem.Review__c
                }
            }));

            if (this.ratings.length > 0) {
                this.hasRating = true;
            }

            this.error = undefined;
        } else if (result.error) {
            this.error = result.error;
            this.ratings = undefined;
        }
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
        const cloneData = [...this.ratings];
        
        cloneData.sort(this.sortBy(sortedBy, sortDirection === 'asc' ? 1 : -1));
        this.ratings = cloneData;
        this.sortDirection = sortDirection;
        this.sortedBy = sortedBy;
    }

}