import { LightningElement, wire, track } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import getContact from '@salesforce/apex/getProperties.getContactFromUser';
import getAccount from '@salesforce/apex/getProperties.getAccountFromContact';
import getRecordType from '@salesforce/apex/getProperties.getTypeFromAccount';
import getTenants from '@salesforce/apex/getProperties.getTenantsFromAccount';
import getProperties from '@salesforce/apex/getProperties.getPortfolioProperties';
import USER_ID from '@salesforce/user/Id';

// Tenant record types IDs; first is person account, second is standard account
const TENANT_ID = '012Dn000000gsCzIAI';
const TENANT_ID_2 = '012Dn000000gfNnIAI';

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
    @track wiredTenants = [];
    @track tenants = [];

    // Results from wired queries
    @track userId = USER_ID;
    @track contactId;
    @track accountId;
    @track recordTypeId;
    @track tenantIds = [];
    @track propertyIds = [];

    // User and property information
    @track myProperties = [];
    isTenant = false;
    userFirstName;
    userLastName;
    numProperties = 0;
    oneProperty = false;

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

    // Get Account ID (and User's Name) from Contact
    @wire (getAccount, {conId : "$contactId"}) getAccount(result) {
        this.wiredContacts = result;

        if (result.data) {
            this.contacts = result.data;
            console.log("ACCOUNTID", this.contacts[0].AccountId);
            console.log("NAME", this.contacts[0].FirstName, this.contacts[0].LastName);
            this.accountId = this.contacts[0].AccountId;
            this.userFirstName = this.contacts[0].FirstName;
            this.userLastName = this.contacts[0].LastName;
            this.error = undefined;
        } else if (result.error) {
            this.error = result.error;
            this.contacts = [];
        }
    }

    // Get Record Type Name from Account, Checking if Tenant
    @wire (getRecordType, {accId : "$accountId"}) getRecordType(result) {
        this.wiredAccounts = result;

        if (result.data) {
            this.accounts = result.data;
            console.log("RECORDTYPEID", this.accounts[0].RecordTypeId);
            this.recordTypeId = this.accounts[0].RecordTypeId;
            if (this.recordTypeId == TENANT_ID || this.recordTypeId == TENANT_ID_2) {
                this.isTenant=true;
            }
            this.error = undefined;
        } else if (result.error) {
            this.error = result.error;
            this.accounts = [];
        }
    }

    // Get Tenants from Account
    @wire (getTenants, {accId : "$accountId"}) getTenants(result) {
        this.wiredTenants = result;

        if (result.data) {
            this.tenants = result.data;
            this.tenantIds = [];
            if (this.tenants.length > 0) {
                for (let i = 0; i < this.tenants.length; i++) {
                    console.log("TENANT", i, this.tenants[i].Id);
                    console.log("PROPERTY", i, this.tenants[i].Property__c);
                    this.tenantIds.push(this.tenants[i].Id);
                    this.propertyIds.push(this.tenants[i].Property__c);
                }
            }
            this.error = undefined;
        } else if (result.error) {
            this.error = result.error;
            this.tenants = [];
        }
    }

    // Fetch Property Records
    @wire (getProperties, {propOwnerIds : "$tenantIds"}) getProperties(result) {
        this.wiredProperties = result;
        if (result.data) {
            this.properties = result.data;
            if (this.properties.length > 0) {
                for (let i = 0; i < this.properties.length; i++) {
                    for (let j = 0; j < this.tenants.length; j++) {
                        if (this.properties[i].Id == this.tenants[j].Property__c) {
                            // If a property is found belonging to tenant, add it to the list
                            this.numProperties++;
                            if (this.numProperties == 1) {
                                this.oneProperty = true;
                            } else {
                                this.oneProperty = false;
                            }
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