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

    @track searchedProperties = [];

     // Custom Event from Child Component: Searching & Sorting
    handleSearchSort(event) {
        this.searchedProperties = event.detail.searchedProperties;
        this.template.querySelector('c-portfolio-content').updateProperties(this.searchedProperties);
    }

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

    // Get Account ID, Name, and Address Info from Contact
    @wire (getAccount, {conId : "$contactId"}) getAccount(result) {
        this.wiredContacts = result;

        if (result.data) {
            this.contacts = result.data;
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
            this.recordTypeId = this.accounts[0].RecordTypeId;
            if (this.recordTypeId == PROPERTY_OWNER_ID || this.recordTypeId == PROPERTY_OWNER_ID_2) {
                this.isPropertyOwner=true;
            }
            if (!this.userLat) this.userLat = this.accounts[0].BillingLatitude;
            if (!this.userLon) this.userLon = this.accounts[0].BillingLongitude;
            if (this.userLat && this.userLon) {
                this.locationNotFound = false;
            }
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
            }
            this.error = undefined;
        } else if (result.error) {
            this.error = result.error;
        }
    }
}