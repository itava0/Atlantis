import { api, wire, track } from 'lwc';
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import { refreshApex } from '@salesforce/apex';
import { getObjectInfo, getPicklistValues } from 'lightning/uiObjectInfoApi';
import getAvailableStaffProperties from '@salesforce/apex/getProperties.getAvailableStaffProperties';
import createStaff from '@salesforce/apex/ManageStaff.createStaff';
import updateStaff from '@salesforce/apex/ManageStaff.updateStaff';
import LightningModal from 'lightning/modal';
import STAFF_OBJECT from '@salesforce/schema/Staff__c';
import ROLE_FIELD from '@salesforce/schema/Staff__c.Role__c';
import { publish, MessageContext } from "lightning/messageService";
import STAFFUPDATEDMC from "@salesforce/messageChannel/StaffUpdated__c";

const DELAY = 350;

export default class ManageStaffModal extends LightningModal {
    // For tracking information from wire, api, and user selection
    @api content;
    @api hasStaff;
    @api portfolio;
    @api accounts;
    @api staffPicklist;
    @api propertyId;
    @api propertyName;
    @api accountName;
    @api accountId;
    @api staffId;
    @track propertyPicklist = [];
    @track wiredAvailableProperties = [];
    @track availableProperties = [];
    @track error;
    addStaffHeader;
    manageStaffHeader;
    curStaff;
    curProperty;
    curRole;
    propertyPicklistLoaded = false;
    msgStaff;
    submitReady = false;

    @wire(MessageContext)
    messageContext;

    // NOTE: There are two variants of this component, "Add Staff" for adding a staff member to a property without one,
    // and "Manage Staff" for reassigning a staff member already assigned. For the sake of readability, methods that
    // are unique to each will have initial comments starting with "ADD:" or "MANAGE:".

    connectedCallback() {
        // Determine Headers for assigning or reassigning staff taff
        if (this.hasStaff) {
            this.manageStaffHeader = "Reassign Staff: " + this.accountName;
        } else {
            this.addStaffHeader = "Assign Staff to: " + this.propertyName;
        }
    }

    // ADD: Determine picklist options for roles
    @wire(getObjectInfo, { objectApiName: STAFF_OBJECT }) staffObj;
    @wire(getPicklistValues, { recordTypeId: '$staffObj.data.defaultRecordTypeId', fieldApiName: ROLE_FIELD}) rolePicklist;

    // ADD: Update selected staff
    handleStaffPicklist(event) {
        this.curStaff = event.target.value;
        // Enable button only if both staff and role selected
        if (this.curStaff && this.curRole) {
            this.submitReady = true;
        }
    }

    // MANAGE: Update selected property
    handlePropertyPicklist(event) {
        this.curProperty = event.target.value;
        // Enable button only if both property and role selected
        if (this.curProperty && this.curRole) {
            this.submitReady = true;
        }
    }

    // Update selected role
    handleRolePicklist(event) {
        this.curRole = event.target.value;
        // Enable button only if both role and either property or staff selected (depending on assignment or reassignment)
        if ((!this.hasStaff && this.curStaff && this.curRole) || (this.hasStaff && this.curProperty && this.curRole)) {
            this.submitReady = true;
        }
    }

    // ADD: Assign new staff to a property
    assignNewStaff() {
        createStaff({ propId: this.propertyId, accId: this.curStaff, role: this.curRole })
        .then((result) => {
            const evt = new ShowToastEvent({
                title: "Staff assigned",
                variant: "success"
            });
            this.msgStaff = result;
            refreshApex(this.wiredAvailableProperties);
            this.fireChangeEvent();
            this.dispatchEvent(evt);
            this.close();
        }).catch((error) => {
            const evt = new ShowToastEvent({
                title: "Error assigning staff",
                message: error.body.message,
                variant: "error"
            });
            this.dispatchEvent(evt);
        });
    }

    // MANAGE: Reassign staff member to new property
    reassignStaff() {
        updateStaff({ staffId: this.staffId, propId: this.curProperty, role: this.curRole })
        .then((result) => {
            const evt = new ShowToastEvent({
                title: "Staff reassigned",
                variant: "success"
            });
            this.msgStaff = result;
            refreshApex(this.wiredAvailableProperties);
            this.fireChangeEvent();
            this.dispatchEvent(evt);
            this.close();
        }).catch((error) => {
            const evt = new ShowToastEvent({
                title: "Error reassigning staff",
                message: error.body.message,
                variant: "error"
            });
            this.dispatchEvent(evt);
        })
    }

    // MANAGE: Retrieve available properties based on staff member
    @wire(getAvailableStaffProperties, { propId: "$propertyId", accId: "$accountId", portfolio: "$portfolio" }) getAvailableStaffProperties(result) {
        this.wiredAvailableProperties = result;
        this.propertyPicklistLoaded = false;
        if (result.data) {
            this.availableProperties = result.data;
            for (let i = 0; i < this.availableProperties.length; i++) {
                this.propertyPicklist.push({ label : this.availableProperties[i].Billing_Street__c, value : this.availableProperties[i].Id });
            }
            this.propertyPicklistLoaded = true;
            this.error = undefined;
        } else if (result.error) {
            this.error = result.error;
            this.availableProperties = undefined;
        }
    }

    // Send message channel of updated information to original component that called modal
    fireChangeEvent() {
        // Debouncing this method: Do not actually fire the event as long as this function is
        // being called within a delay of DELAY. This is to avoid a very large number of Apex
        // method calls in components listening to this event.
        window.clearTimeout(this.delayTimeout);
    
        // Sends variables, primarily for filters, through message channel
        this.delayTimeout = setTimeout(() => {
            const fields = {
                msgStaff: this.msgStaff
            };
            publish(this.messageContext, STAFFUPDATEDMC, fields);
        }, DELAY);
    }

    handleClose() {
        this.close();
    }
}