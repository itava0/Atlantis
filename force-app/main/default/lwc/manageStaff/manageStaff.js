import { LightningElement, api, wire, track } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import { subscribe, unsubscribe, MessageContext } from "lightning/messageService";
import { refreshApex } from '@salesforce/apex';
import STAFFUPDATEDMC from "@salesforce/messageChannel/StaffUpdated__c";
import getStaffAccounts from '@salesforce/apex/getProperties.getStaffAccounts';
import getStaffMembers from '@salesforce/apex/getProperties.getStaffMembers';
import getPropertyName from '@salesforce/apex/getProperties.getPropertyName';
import ManageStaffModal from 'c/manageStaffModal';
import ManageStaffDeleteModal from 'c/manageStaffDeleteModal';

export default class ManageStaff extends NavigationMixin(LightningElement) {
    @api recordId;
    @api portfolio;
    @track propertyName;
    @track error;
    @track accounts = [];
    @track accountIds = [];
    @track wiredStaff = [];
    @track staff = [];
    @track staffPicklist = [];
    @track propertyPicklist = [];
    @track staffId;
    @track accountName;
    @track accountId;
    hasStaff = false;
    subscription;
    updatedStaff;

    @wire(MessageContext)
    messageContext;

    // Subscribe to message channel
    connectedCallback() {
        this.subscription = subscribe(
            this.messageContext,
            STAFFUPDATEDMC,
            (message) => {
                this.handleStaffUpdated(message);
            }
        );
    }

    // Unsubscribe from message channel
    disconnectedCallback() {
        unsubscribe(this.subscription);
        this.subscription = null;
    }

    // When received from message channel, update staff data
    handleStaffUpdated(message) {
        this.updatedStaff = message.msgStaff;
        refreshApex(this.wiredStaff);
    }

    // Retrieve list of staff accounts
    @wire(getStaffAccounts) getStaffAccounts(result) {
        if (result.data) {
            // Track list of accounts for Ids and picklist options
            this.accounts = result.data;
            for (let i = 0; i < this.accounts.length; i++) {
                this.accountIds.push(this.accounts[i].Id);
                this.staffPicklist.push({ label : this.accounts[i].Name, value : this.accounts[i].Id });
            }
            this.error = undefined;
        } else if (result.error) {
            this.error = result.error;
            this.accounts = undefined;
        }
    }

    // Retrieve staff members based on property
    @wire(getStaffMembers, { propId: "$recordId" }) getStaffMembers(result) {
        this.wiredStaff = result;
        if (result.data) {
            this.staff = result.data;
            if (this.staff.length > 0) {
                this.hasStaff = true;
            } else {
                this.hasStaff = false;
            }
            this.error = undefined;
        } else if (result.error) {
            this.error = result.error;
            this.staff = undefined;
        }
    }

    // Get name of current property
    @wire(getPropertyName, { propId: "$recordId" }) getPropertyName(result) {
        if (result.data) {
            this.propertyName = result.data[0].Billing_Street__c;
            this.error = undefined;
        } else if (result.error) {
            this.error = result.error;
            this.propertyName = undefined;
        }
    }

    // View profile of staff member
    viewProfile(event) {
        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId: event.target.value,
                objectApiName: 'User',
                actionName: 'view'
            }
        });
    }

    // // Switch staff member's assigned role
    // switchRole() {
    //     console.log("SWITCH ROLE");
    // }

    // Reassign staff member to different property
    reassign(event) {
        this.staffId = event.target.value;
        this.accountId = event.target.dataset.accountid;
        this.accountName = event.target.dataset.accountname;
        this.loadModal(true);
    }

    // Assign staff members to a property without staff
    assignStaff() {
        this.loadModal(false);
    }

    // Remove staff member from property
    remove(event) {
        this.accountName = event.target.dataset.accountName;
        this.propertyName = event.target.dataset.propertyName;
        this.loadDeleteModal(event.target.value);
    }

    // Load modal for managing staff (adding new or reassignment based on if staff are already assigned)
    async loadModal(hasStaff) {
        await ManageStaffModal.open({
            size: 'small',
            description: 'description',
            content: 'content',
            hasStaff: hasStaff,
            accounts: this.accounts,
            accountIds: this.accountIds,
            staffPicklist: this.staffPicklist,
            portfolio: this.portfolio,
            propertyId: this.recordId,
            propertyName: this.propertyName,
            staffId: this.staffId,
            accountId: this.accountId,
            accountName: this.accountName
        })
    }

    // Load modal for managing staff (separate component to confirm assignment removal)
    async loadDeleteModal(staffId) {
        await ManageStaffDeleteModal.open({
            size: 'small',
            description: 'description',
            content: 'content',
            recordId: staffId,
            propertyId: this.recordId
        })
    }
}