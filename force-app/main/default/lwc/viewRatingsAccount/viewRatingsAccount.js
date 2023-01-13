import { LightningElement, wire, api, track } from 'lwc';
import getRatings from '@salesforce/apex/getProperties.getAccountRatings';
import getContact from '@salesforce/apex/getProperties.getContactFromUser';
import getAccount from '@salesforce/apex/getProperties.getAccountFromContact';
import USER_ID from '@salesforce/user/Id';
import ACCOUNT_OBJECT from "@salesforce/schema/Account";
import OVERALL_RATING_FIELD from "@salesforce/schema/Account.Rating__c";

// Columns for datatable
const columns = [
    { label : 'User', fieldName : 'User_Name', sortable : true, wrapText : false},
    { label : 'Score', fieldName : 'Score', sortable : true, wrapText : false},
    { label : 'Review', fieldName : 'Review', sortable : true, wrapText : true}
];

export default class ViewRatingsAccount extends LightningElement {

    // For tracking rating
    @track ratings = [];
    @track error;
    @api accountId;
    hasRating = false;
    
    // For columns and sorting
    columns = columns;
    defaultSort = 'desc';
    sortDirection = 'desc';
    sortedBy;

    // For connecting logged in user to rated account
    @track wiredUsers = [];
    @track users = [];
    @track wiredContacts = [];
    @track contacts = [];
    @track userId = USER_ID;
    @track contactId;
    @track accountId;
    accountObj = ACCOUNT_OBJECT;
    overallRating = OVERALL_RATING_FIELD;

    @api
    get recordId() {
        return this.accountId;
    }

    set recordId(accountId) {
        this.accountId = accountId;
    }

    // Get ratings for account
    @wire (getRatings, {accId : "$accountId"}) getRatings(result) {
        if (result.data) {
            this.ratings = result.data.map((elem) => ({
                ...elem,
                ...{
                    'Rating_Id' : elem.Id,
                    'User_Id' : elem.User__c,
                    'Account_Id' : elem.Account__c,
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

    // Get Account ID from Contact
    @wire (getAccount, {conId : "$contactId"}) getAccount(result) {
        this.wiredContacts = result;

        if (result.data) {
            this.contacts = result.data;
            console.log("ACCOUNTID", this.contacts[0].AccountId);
            this.accountId = this.contacts[0].AccountId;
            this.error = undefined;
        } else if (result.error) {
            this.error = result.error;
            this.contacts = [];
        }
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