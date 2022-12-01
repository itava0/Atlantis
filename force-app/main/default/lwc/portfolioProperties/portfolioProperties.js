import { LightningElement, wire, track } from 'lwc';
import { refreshApex } from '@salesforce/apex';
import getProperties from '@salesforce/apex/getProperties.getPortfolioProperties';
import getContact from '@salesforce/apex/getProperties.getContactFromUser'
import getAccount from '@salesforce/apex/getProperties.getAccountFromContact'
import getRecordType from '@salesforce/apex/getProperties.getTypeFromAccount'
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

    @track userId = USER_ID;
    @track contactId;
    @track accountId;
    @track recordTypeId;

    isPropertyOwner = false;

    // Fetch Property Records
    @wire (getProperties) getProperties(result) {
        this.wiredProperties = result;

        if (result.data) {
            // console.log("DATA", JSON.stringify(result.data));
            this.properties = result.data;
            this.error = undefined;
        } else if (result.error) {
            this.error = result.error;
            this.properties = [];
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

}