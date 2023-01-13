import { LightningElement, api, wire, track } from 'lwc';
import PROPERTY_OBJECT from "@salesforce/schema/Property__c";
import getLease from '@salesforce/apex/getProperties.getLease';
import getLeaseHistory from '@salesforce/apex/getProperties.getLeaseHistory';

// Columns for datatable
const columns = [
    { label : 'Date', fieldName : 'CreatedDate', sortable : true, wrapText : false},
    { label : 'Field', fieldName : 'Field', sortable : false, wrapText : true},
    { label : 'Original Value', fieldName : 'OldValue', sortable : false, wrapText : true},
    { label : 'New Value', fieldName: 'NewValue', sortable : false, wrapText : true}
];

export default class LeaseHistory extends LightningElement {
    // For tracking leases and lease history
    @track leases = [];
    @track leaseHistory = [];
    @track error;
    @api propertyId;
    leaseId;
    propertyObj = PROPERTY_OBJECT;
    hasLease = false;
    hasLeaseHistory = false;

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

    // Get lease from property
    @wire (getLease, {propId : "$propertyId"}) getLease(result) {
        if (result.data) {
            this.leases = result.data;
            if (this.leases.length > 0) {
                this.leaseId = this.leases[0].Id;
                this.hasLease = true;
            }

            this.error = undefined;
        } else if (result.error) {
            this.error = result.error;
            this.leases = undefined;
        }
    }

    // Get lease history from lease
    @wire (getLeaseHistory, {contId : "$leaseId"}) getLeaseHistory(result) {
        if (result.data) {
            this.leaseHistory = result.data.map((elem) => ({
                ...elem,
                ...{
                    'HistoryId' : elem.Id,
                    'ContractId' : elem.ContractId,
                    'Field' : elem.Field,
                    'OldValue' : elem.OldValue,
                    'NewValue' : elem.NewValue,
                    'CreatedDate' : elem.CreatedDate
                }
            }));

            if (this.leaseHistory.length > 0) {
                this.hasLeaseHistory = true;
            }

            this.error = undefined;
        } else if (result.error) {
            this.error = result.error;
            this.leaseHistory = undefined;
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
        const cloneData = [...this.leases];
        
        cloneData.sort(this.sortBy(sortedBy, sortDirection === 'asc' ? 1 : -1));
        this.leases = cloneData;
        this.sortDirection = sortDirection;
        this.sortedBy = sortedBy;
    }

}