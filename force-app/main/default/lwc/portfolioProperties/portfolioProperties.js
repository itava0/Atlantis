import { LightningElement, wire, track } from 'lwc';
import getContact from '@salesforce/apex/getProperties.getContactFromUser';
import getAccount from '@salesforce/apex/getProperties.getAccountFromContact';
import getRecordType from '@salesforce/apex/getProperties.getTypeFromAccount';
import getPropertyOwners from '@salesforce/apex/getProperties.getPropertyOwnersFromAccount';
import getProperties from '@salesforce/apex/getProperties.getPortfolioProperties';
import USER_ID from '@salesforce/user/Id';

const PROPERTY_OWNER_ID = '012Dn000000gsCuIAI';

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

    @track userId = USER_ID;
    @track contactId;
    @track accountId;
    @track recordTypeId;
    @track propertyOwnerIds = [];
    @track propertyIds = [];

    @track myProperties = [];

    isPropertyOwner = false;

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

    // Get Record Type Name from Account
    @wire (getRecordType, {accId : "$accountId"}) getRecordType(result) {
        this.wiredAccounts = result;

        if (result.data) {
            this.accounts = result.data;
            console.log("RECORDTYPEID", this.accounts[0].RecordTypeId);
            this.recordTypeId = this.accounts[0].RecordTypeId;
            if (this.recordTypeId == PROPERTY_OWNER_ID) {
                this.isPropertyOwner=true;
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
                    console.log("PROPERTYOWNER", i, this.propertyOwners[i].Id);
                    console.log("PROPERTY", i, this.propertyOwners[i].Property__c);
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
                            // console.log("RESULT", i, this.properties[i].Billing_Street__c, this.properties[i].Billing_City__c);
                            this.myProperties.push(this.properties[i]);
                        }
                    }
                }
                for (let k = 0; k < this.myProperties.length; k++) {
                    // console.log("NEW RESULT", k + 1, this.myProperties[k].Billing_Street__c, this.myProperties[k].Billing_City__c)
                }
            }
            this.error = undefined;
        } else if (result.error) {
            this.error = result.error;
        }
    }

}