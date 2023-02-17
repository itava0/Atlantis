import { LightningElement, api, wire, track } from 'lwc';
import { getRecord, getFieldValue } from "lightning/uiRecordApi";
import { NavigationMixin } from 'lightning/navigation';
import getLeases from '@salesforce/apex/CustomerLeaseHistoryHandler.getLeases';
import ACCOUNT_ID from '@salesforce/schema/Contact.AccountId'
import USER_ID from '@salesforce/user/Id';
import CONTACT_ID from '@salesforce/schema/User.ContactId'

const columns = [
    {
        label: 'Lease',
        fieldName: 'ContractNumber',
        type: 'button',
        typeAttributes: {
            label: { fieldName: 'ContractNumber' },
            title: { fieldName: 'ContractNumber' },
            variant: 'base',
            class: 'text-button'
        },
        sortable: "true"
    },
    { label: 'Start Date', fieldName: 'StartDate', type: 'date', sortable: "true"},
    { label: 'End Date', fieldName: 'EndDate', type: 'date', sortable: "true"},
];

export default class CustomerLeaseHistory extends NavigationMixin(LightningElement) {
    @api recordId;
    data = [];
    columns = columns;
    @track sortBy;
    @track sortDirection;

    @wire(getRecord, { recordId: USER_ID, fields: [CONTACT_ID] }) user;
    @wire(getRecord, { recordId: '$contactId', fields: [ACCOUNT_ID] }) contact;

    @wire(getLeases, { accountId: '$accountId' })
    leasesData(records) {
        console.log(this.accountId);
        if(records.data) {
            console.log(records.data);
            this.data = records.data.map(row => ({ ...row, ContractNumber: "#"+String(row.ContractNumber), }));
            console.log(this.data);
        }        
        else {
            console.log("Data error");
        }
    }

    get isCurrentUser(){
        if(USER_ID.includes(this.recordId)) {
            return true;
        }
        return false;
    }

    get contactId() {
        return getFieldValue(this.user.data, CONTACT_ID);
    }

    get accountId() {
        return getFieldValue(this.contact.data, ACCOUNT_ID);
    }

    renderedCallback() {
        console.log(USER_ID);
        console.log(this.recordId);
    }

    redirect() {
        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId: event.detail.row.Id,
                objectApiName: 'Contract',
                actionName: 'view'
            }
        });
    }

    doSorting(event) {
        this.sortBy = event.detail.fieldName;
        this.sortDirection = event.detail.sortDirection;
        this.sortData(this.sortBy, this.sortDirection);
    }

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
}