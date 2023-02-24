import { LightningElement, wire, track } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import getContact from '@salesforce/apex/getProperties.getContactFromUser';
import getAccount from '@salesforce/apex/getProperties.getAccountFromContact';
import getRecordType from '@salesforce/apex/getProperties.getTypeFromAccount';
import getStaff from '@salesforce/apex/getProperties.getStaffFromAccount';
import getProperties from '@salesforce/apex/getProperties.getPortfolioProperties';
import USER_ID from '@salesforce/user/Id';

// Staff record types IDs; first is person account, second is standard account
const STAFF_ID = '012Dn000000hweoIAA';
const STAFF_ID_2 = '012Dn000000hTNfIAM';

export default class PortfolioProperties extends NavigationMixin(LightningElement) {
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
    @track wiredStaff = [];
    @track staff = [];

    // Results from wired queries
    @track userId = USER_ID;
    @track contactId;
    @track accountId;
    @track recordTypeId;
    @track staffIds = [];
    @track propertyIds = [];
    
    // User and property information
    @track myAssignments = [];
    @track staffAccount;
    isStaff = false;
    userFirstName;
    userLastName;
    numProperties = 0;
    oneAssignment = false;

    // Get Contact ID from User
    @wire (getContact, {usrId : "$userId"}) getContact(result) {
        this.wiredUsers = result;
        if (result.data) {
            this.users = result.data;
            this.contactId = this.users[0].ContactId;
            this.error = undefined;
        } else if (result.error) {
            this.error = result.error;
            this.users = [];
        }
    }

    // Get Account ID (and User's Name) from Contact
    @wire (getAccount, {conId : "$contactId"}) getAccount(result) {
        this.wiredContacts = result;

        if (result.data) {
            this.contacts = result.data;
            this.accountId = this.contacts[0].AccountId;
            this.userFirstName = this.contacts[0].FirstName;
            this.userLastName = this.contacts[0].LastName;
            this.error = undefined;
        } else if (result.error) {
            this.error = result.error;
            this.contacts = [];
        }
    }

    // Get Record Type Name from Account, Checking if Staff
    @wire (getRecordType, {accId : "$accountId"}) getRecordType(result) {
        this.wiredAccounts = result;

        if (result.data) {
            this.accounts = result.data;
            this.staffAccount = this.accounts[0].Id;
            this.recordTypeId = this.accounts[0].RecordTypeId;
            if (this.recordTypeId == STAFF_ID || this.recordTypeId == STAFF_ID_2) {
                this.isStaff = true;
            }
            this.error = undefined;
        } else if (result.error) {
            this.error = result.error;
            this.accounts = [];
        }
    }

    // Get Staff from Account
    @wire (getStaff, {accId : "$accountId"}) getStaff(result) {
        this.wiredStaff = result;

        if (result.data) {
            this.staff = result.data;
            this.staffIds = [];
            if (this.staff.length > 0) {
                for (let i = 0; i < this.staff.length; i++) {
                    this.staffIds.push(this.staff[i].Id);
                    this.propertyIds.push(this.staff[i].Property__c);
                }
            }
            this.error = undefined;
        } else if (result.error) {
            this.error = result.error;
            this.staff = [];
        }
    }

    // Fetch Property Records
    @wire (getProperties, {propOwnerIds : "$staffIds"}) getProperties(result) {
        this.wiredProperties = result;
        if (result.data) {
            this.properties = result.data;
            if (this.properties.length > 0) {
                for (let i = 0; i < this.properties.length; i++) {
                    for (let j = 0; j < this.staff.length; j++) {
                        if (this.properties[i].Id == this.staff[j].Property__c) {
                            // If a property is found with a staff assignment, add it to the list
                            this.numProperties++;
                            if (this.numProperties == 1) {
                                this.oneAssignment = true;
                            } else {
                                this.oneAssignment = false;
                            }
                            this.myAssignments.push(this.properties[i]);
                        }
                    }
                }
            }
            this.error = undefined;
        } else if (result.error) {
            this.error = result.error;
        }
    }
}