import { api, wire, track } from 'lwc';
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import { refreshApex } from '@salesforce/apex';
import getAvailableStaffProperties from '@salesforce/apex/getProperties.getAvailableStaffProperties';
import createStaff from '@salesforce/apex/ManageStaff.createStaff';
import updateStaff from '@salesforce/apex/ManageStaff.updateStaff';
import LightningModal from 'lightning/modal';
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
    propertyPicklistLoaded = false;
    msgStaff;

    @wire(MessageContext)
    messageContext;

    // NOTE: There are two variants of this component, "Add Staff" for adding a staff member to a property without one,
    // and "Manage Staff" for reassigning a staff member already assigned. For the sake of readability, methods that
    // are unique to each will have initial comments starting with "ADD:" or "MANAGE:".

    connectedCallback() {
        if (this.hasStaff) {
            this.manageStaffHeader = "Reassign Staff: " + this.accountName;
        } else {
            this.addStaffHeader = "Assign Staff to: " + this.propertyName;
        }
    }

    // ADD: Update selected staff
    handleStaffPicklist(event) {
        this.curStaff = event.target.value;
    }

    // ADD: Assign new staff to a property
    assignNewStaff() {
        createStaff({ propId: this.propertyId, accId: this.curStaff })
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

    // MANAGE: Update selected property
    handlePropertyPicklist(event) {
        this.curProperty = event.target.value;
    }

    // MANAGE: Reassign staff member to new property
    reassignStaff() {
        updateStaff({ staffId: this.staffId, propId: this.curProperty })
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