import { LightningElement, wire, track } from 'lwc';
import { getRecord, getFieldValue } from "lightning/uiRecordApi";
import { refreshApex } from '@salesforce/apex';
import getBaseRequests from '@salesforce/apex/ViewMaintenanceHandler.getBaseRequests';
import getFilteredRequests from '@salesforce/apex/ViewMaintenanceHandler.getFilteredRequests';
import getProperties from '@salesforce/apex/ViewMaintenanceHandler.getProperties';
import deleteRequests from '@salesforce/apex/ViewMaintenanceHandler.deleteRequests';
import ACCOUNT_ID from '@salesforce/schema/Contact.AccountId'
import USER_ID from '@salesforce/user/Id';
import CONTACT_ID from '@salesforce/schema/User.ContactId'

//datatable columns
const columns = [
    {
        label: 'Case Number',
        fieldName: 'CaseNumber',
        type: 'button',
        typeAttributes: {
            label: { fieldName: 'CaseNumber' },
            title: { fieldName: 'CaseNumber' },
            variant: 'base',
            class: 'text-button'
        },
        sortable: "true"
    },
    { label: 'Property', fieldName: 'Property', sortable: "true"},
    { label: 'Created Date', fieldName: 'CreatedDate', type: 'date', sortable: "true"},
    { label: 'Closed Date', fieldName: 'ClosedDate', type: 'date', sortable: "true"},
    { label: 'Subject', fieldName: 'Subject', sortable: "true"},
    { label: 'Type', fieldName: 'Type', type: 'picklist', sortable: "true"},
    { label: 'Rating', fieldName: 'Rating', type: 'number' , cellAttributes: { alignment: 'left' }, sortable: "true"},
];
export default class ViewRequests extends LightningElement {
    data=[];
    wiredData=[];
    baseData=[];
    filteredData=[];
    propertyList = [];
    selectedRows = [];
    columns = columns;
    inputSubject = '';
    inputProperty = '';
    inputType = '';
    inputClosed = 'both';
    inputMin = '';
    inputMax = '';
    properties;
    openModal = false;
    @track sortBy;
    @track sortDirection;

    @wire(getRecord, { recordId: USER_ID, fields: [CONTACT_ID] }) user;
    @wire(getRecord, { recordId: '$contactId', fields: [ACCOUNT_ID] }) contact;
    //get associated properties
    @wire(getProperties, { AccountId: '$accountId' })
    accountProperties(records) {
        if(records.data) {
            console.log("getProperties");
            console.log(this.accountId);
            console.log(records.data);
            this.properties = records.data;
        }
        else {
            console.log("Get account properties error");
        }
    }

    get contactId() {
        this.conId = getFieldValue(this.user.data, CONTACT_ID);
        return getFieldValue(this.user.data, CONTACT_ID);
    }

    get accountId() {
        console.log(getFieldValue(this.contact.data, ACCOUNT_ID));
        this.accId = getFieldValue(this.contact.data, ACCOUNT_ID);
        return getFieldValue(this.contact.data, ACCOUNT_ID);
    }

    //get all requests associated with account. Initial data
    @wire (getBaseRequests, {AccountId: '$accountId'})
    conRecords(records){
        this.wiredData = records;
        if(records.data) {
            this.data = records.data
                .map(row => ({ ...row, CaseNumber: "#"+String(row.CaseNumber), }))
                .map(row => ({ ...row, Property: row.PropertyId__r.Billing_Street__c, }))
                .map(row => ({ ...row, Rating: row.Overall__c }));
        }
        else {
            console.log("Data error 1");
        }
    }

    //get all requests associated with account. Data to switch back to for clear
    @wire (getBaseRequests, {AccountId: '$accountId'})
    conBaseRecords(records){
        this.wiredData = records;
        if(records.data) {
            this.baseData = records.data
                .map(row => ({ ...row, CaseNumber: "#"+String(row.CaseNumber), }))
                .map(row => ({ ...row, Property: row.PropertyId__r.Billing_Street__c, }))
                .map(row => ({ ...row, Rating: row.Overall__c }));
        }
        else {
            console.log("Data error 2");
        }
    }

    //get all requests associated with account, filtered by search input
    @wire (getFilteredRequests, {AccountId: '$accountId', searchSubject: '$inputSubject', 
        searchProperty: '$inputProperty', searchType: '$inputType', open: '$inputClosed',
        searchMin: '$inputMin', searchMax: '$inputMax'})
    filteredRequests(records){
        if(records.data) {
            console.log("Filtered Data:");
            console.log(records.data);
            this.filteredData = records.data
                .map(row => ({ ...row, CaseNumber: "#"+String(row.CaseNumber), }))
                .map(row => ({ ...row, Property: row.PropertyId__r.Billing_Street__c, }))
                .map(row => ({ ...row, Rating: row.Overall__c }));
        }
        else {
            console.log("Data error 3");
        }
    }
    
    //properties picklist. Only associated properties
    get propertyOptions() {
        this.propertyList = [];
        this.propertyList = [...this.propertyList, {
            label: '',
            value: ''
        }];
        for(let i = 0; i < this.properties.length; i += 1) {
            this.propertyList = [...this.propertyList, {
                label: String(this.properties[i].Billing_Street__c),
                value: String(this.properties[i].Billing_Street__c)
            }];
        }
        return this.propertyList;
    }

    handlePropertyCombobox(event) {
        this.inputProperty = event.detail.value;
    }

    get typeOptions() {
        return [
            { label: '', value: '' },
            { label: 'Mechanical', value: 'Mechanical' },
            { label: 'Electrical', value: 'Electrical' },
            { label: 'Electronic', value: 'Electronic' },
            { label: 'Structural', value: 'Structural' },
            { label: 'Other', value: 'Other' },
        ];
    }

    handleTypeCombobox(event) {
        this.inputType = event.detail.value;
    }

    get closedOptions() {
        return [
            { label: 'Both', value: 'both' },
            { label: 'Open', value: 'open' },
            { label: 'Closed', value: 'closed' },
        ];
    }
    

    handleClosedCombobox(event) {
        this.inputClosed = event.detail.value;
    }


    handleSubjectSearch(event) {
        this.inputSubject = event.target.value;
    }

    handleMin(event) {
        this.inputMin = String(event.target.value);
    }

    handleMax(event) {
        this.inputMax = String(event.target.value);
    }

    handleSearch() {
        this.data = this.filteredData;
    }

    //clear search inputs and switch to all requests data
    handleShowAll() {
        this.inputName = '';
        this.inputLevel = '';
        this.inputClosed = 'both';
        this.inputMin = '';
        this.inputMax = '';
        this.inputProperty = '';
        this.template.querySelectorAll('lightning-input[data-id="nameInput"]').forEach(element => {
            element.value = null;
        });
        this.template.querySelectorAll('lightning-combobox[data-id="LevelInput"]').forEach(each => {
            each.value = null;
        });
        this.data = this.baseData;
    }

    //sort data by field
    doSorting(event) {
        this.sortBy = event.detail.fieldName;
        this.sortDirection = event.detail.sortDirection;
        this.sortData(this.sortBy, this.sortDirection);
    }

    //sort
    sortData(fieldname, direction) {
        let parseData = JSON.parse(JSON.stringify(this.data));
        // Return the value stored in the field
        let keyValue = (a) => {
            return a[fieldname];
        };
        // cheking reverse direction
        let isReverse = direction === 'asc' ? 1: -1;
        // sorting data
        parseData.sort((x, y) => {
            x = keyValue(x) ? keyValue(x) : ''; // handling null values
            y = keyValue(y) ? keyValue(y) : '';
            // sorting values based on direction
            return isReverse * ((x > y) - (y > x));
        });
        this.data = parseData;
    }    

    handleRowSelection(event) {
        this.selectedRows = event.detail.selectedRows;
        console.log(this.selectedRows);
    }

    get noSelection() {
        if(this.selectedRows.length > 0) {
            return false;
        }
        else {
            return true;
        }
    }

    //delete selected rows from database
    deleteSelection() {
        let deleteList = [];
        for( var i = 0; i < this.selectedRows.length; i += 1) {
            deleteList = [...deleteList, this.selectedRows[i].Id];
        }
        console.log(deleteList);
        deleteRequests({idList: deleteList})
        .then((response) => {
            console.log(response)
            this.template.querySelector('lightning-datatable').selectedRows=[];
            this.closeDeleteModal();
            return refreshApex(this.wiredData);
        })
        .catch((error) =>{
            console.log(error)
            this.closeDeleteModal();
        })
    }

    showModal(event) {
        this.openModal = true;
        console.log(event.detail.row.Id);
        this.template.querySelector("c-view-requests-modal").getCase(event.detail.row.Id);
    }

    handleCloseModal() {
        this.openModal = false;
    }

    // generic function to get return document element
    querySelectorHelper(element){
        return this.template.querySelector(element);
    }

    deleteSelectionModal() {
        this.querySelectorHelper('.modalSection').classList.add('slds-fade-in-open');
        this.querySelectorHelper('.backdropDiv').classList.add('slds-backdrop_open');
    }

    closeDeleteModal() {
        this.querySelectorHelper('.modalSection').classList.remove('slds-fade-in-open');
        this.querySelectorHelper('.backdropDiv').classList.remove('slds-backdrop_open');
    }

}