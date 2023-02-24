import { api, wire } from 'lwc';
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import { getObjectInfo, getPicklistValues } from 'lightning/uiObjectInfoApi';
import roleStaff from '@salesforce/apex/ManageStaff.roleStaff';
import LightningModal from 'lightning/modal';
import STAFF_OBJECT from '@salesforce/schema/Staff__c';
import ROLE_FIELD from '@salesforce/schema/Staff__c.Role__c';
import { publish, MessageContext } from "lightning/messageService";
import STAFFUPDATEDMC from "@salesforce/messageChannel/StaffUpdated__c";

const DELAY = 350;

export default class ManageStaffRoleModal extends LightningModal {
    @api recordId;
    @api propertyId;
    @api accountName;
    @api propertyName;
    @api staffRole;
    roleHeader;
    curRole;
    msgStaff;

    @wire(MessageContext)
    messageContext;

    connectedCallback() {
        // Determine header based on account and property
        this.roleHeader = "Update Role: " + this.accountName + ", " + this.propertyName;
    }

    // Determine picklist options for roles
    @wire(getObjectInfo, { objectApiName: STAFF_OBJECT }) staffObj;
    @wire(getPicklistValues, { recordTypeId: '$staffObj.data.defaultRecordTypeId', fieldApiName: ROLE_FIELD}) rolePicklist;

    // Update selected role
    handleRolePicklist(event) {
        this.curRole = event.target.value;
    }

    // Update role of staff member
    updateRole() {
        // If role remains default (from previous assignment), ensure it carries over to new assignment
        if (!this.curRole) {
            this.curRole = this.staffRole;
        }
        // Apex method to update role of staff record
        roleStaff({ staffId: this.recordId, role: this.curRole })
        .then((result) => {
            const evt = new ShowToastEvent({
                title: "Staff role updated",
                variant: "success"
            });
            this.msgStaff = result;
            this.fireChangeEvent();
            this.dispatchEvent(evt);
            this.close();
        }).catch((error) => {
            const evt = new ShowToastEvent({
                title: "Error updating staff role",
                message: error.body.message,
                variant: "error"
            });
            this.dispatchEvent(evt);
        })
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