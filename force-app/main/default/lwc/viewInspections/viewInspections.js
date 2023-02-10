import { LightningElement, api, wire, track } from 'lwc';
import { subscribe, unsubscribe, MessageContext } from "lightning/messageService";
import { refreshApex } from '@salesforce/apex';
import INSPECTIONUPDATEDMC from "@salesforce/messageChannel/InspectionUpdated__c";
import getInspections from '@salesforce/apex/getProperties.getUpcomingInspections';
import UpdateInspection from 'c/updateInspection';

// Columns for datatable
const columns = [
    { label : 'Date', fieldName : 'Date', sortable : true, wrapText : false},
    { label : 'Time', fieldName : 'Time', sortable : false, wrapText : false},
    // { label : 'DateTime', fieldName : 'DateTime', sortable : false, wrapText : false},
    { label : 'Inspector', fieldName : 'Inspector', sortable : false, wrapText : true},
    { label : 'Subject', fieldName : 'Subject', sortable : false, wrapText : true},
    { label: 'Update', type: 'button-icon', typeAttributes: {
        name: 'Update',
        title: 'Update',
        disabled: false,
        value: 'update',
        variant: 'brand-outline',
        iconName: 'utility:edit'
    }}
];

export default class ViewInspections extends LightningElement {
    @track wiredInspections = [];
    @track inspections = [];
    @track error;
    @api propertyId;
    subscription;

    // For columns and sorting
    columns = columns;
    defaultSort = 'asc';
    sortDirection = 'asc';
    sortedBy;
    hasInspections = false;

    // For updating fields based on updates in modal via message channel
    updatedId;
    updatedDateTime;
    updatedInspector;
    updatedSubjects;

    @api
    get recordId() {
        return this.propertyId;
    }

    set recordId(propertyId) {
        this.propertyId = propertyId;
    }

    @wire(MessageContext)
    messageContext;

    // Get upcoming inspections for property
    @wire (getInspections, {propId : "$propertyId"}) getInspections(result) {
        this.wiredInspections = result;
        if (result.data) {
            this.inspections = result.data.map((elem) => ({
                ...elem,
                ...{
                    'Id' : elem.Id,
                    'Property_Id' : elem.Property__c,
                    'Date' : elem.DateValue__c,
                    'Time' : elem.TimeValue__c,
                    'DateTime' : elem.DateTime__c,
                    'Inspector' : elem.Inspector__r.Name,
                    'Subject' : elem.Subjects__c
                }
            }));

            if (this.inspections.length > 0) {
                this.hasInspections = true;
            }

            this.convertTimeData();

            this.error = undefined;
        } else if (result.error) {
            this.error = result.error;
            this.inspections = undefined;
        }
    }

    // For selecting "Update" button based on row information
    callRowAction(event) {
        let insId = event.detail.row.Id;
        let actionName = event.detail.action.name;
        if (actionName == 'Update') {
            this.loadModal(insId);
        }
    }

    // Convert Salesforce time data to a standard, readable format
    convertTimeData() {
        for (let i = 0; i < this.inspections.length; i++) {
            let hours = this.inspections[i].Time.substring(0, 2);
            let minutes = this.inspections[i].Time.substring(3, 5);
            let ampm = 'AM';
            // Determine if AM or PM
            if (hours >= 12) {
                ampm = 'PM';
            }
            // 12 AM
            if (hours == 0) {
                hrs = 12;
            }
            // PM hour subtraction
            if (hours >= 13 && hours <= 23) {
                hours -= 12;
            }
            // Update time
            this.inspections[i].Time = hours + ':' + minutes + ' ' + ampm;
        }
    }

    // Sorting by fields
    sortBy(field, reverse, primer) {
        const key = primer ? function (x) { return primer(x[field]); } : function (x) { return x[field]; };
        return function (a, b) {
            a = key(a);
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

    // Create modal for updating inspection
    async loadModal(inspectionId) {
        await UpdateInspection.open({
            size: 'small',
            description: 'description',
            content: 'content',
            inspectionId: inspectionId
        })
    }

    // Subscribe to message channel
    connectedCallback() {
        this.subscription = subscribe(
            this.messageContext,
            INSPECTIONUPDATEDMC,
            (message) => {
                this.handleInspectionUpdated(message);
            }
        );
    }

    // Unsubscribe from message channel
    disconnectedCallback() {
        unsubscribe(this.subscription);
        this.subscription = null;
    }

    // When received from message channel, update inspection data
    handleInspectionUpdated(message) {
        this.updatedId = message.inspectionId;
        this.updatedDateTime = message.dateTime;
        this.updatedInspector = message.inspector;
        this.updatedSubjects = message.subjects;
        this.updateInspectionView();
    }

    // Update table based on updated inspection data
    updateInspectionView() {
        for (let i = 0; i < this.inspections.length; i++) {
            if (this.inspections[i].Id == this.updatedId) {
                this.inspections[i].DateTime = this.updatedDateTime;
                this.inspections[i].Inspector = this.updatedInspector;
                this.inspections[i].Subjects = this.updatedSubjects;
                this.convertTimeData();
                this.refreshTable();
            }
        }
    }

    // Refresh Apex datatable
    refreshTable() {
        return refreshApex(this.wiredInspections);
    }
}