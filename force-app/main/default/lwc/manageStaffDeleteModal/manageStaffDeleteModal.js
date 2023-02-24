import { api, wire } from 'lwc';
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import deleteStaff from '@salesforce/apex/ManageStaff.deleteStaff';
import LightningModal from 'lightning/modal';
import { publish, MessageContext } from "lightning/messageService";
import STAFFUPDATEDMC from "@salesforce/messageChannel/StaffUpdated__c";

const DELAY = 350;

export default class ManageStaffDeleteModal extends LightningModal {
    @api recordId;
    @api propertyId;
    @api accountName;
    @api propertyName;
    msgStaff;

    @wire(MessageContext)
    messageContext;

    // Delete staff member after user confirmation
    handleDelete() {
        // Apex method to delete staff record
        deleteStaff({ staffId: this.recordId, propId: this.propertyId })
        .then(() => {
            const evt = new ShowToastEvent({
                title: "Staff assignment removed",
                variant: "success"
            });
            this.fireChangeEvent();
            this.dispatchEvent(evt);
            this.close();
        }).catch((error) => {
            const evt = new ShowToastEvent({
                title: "Error removing staff assignment",
                message: error.body.message,
                variant: "error"
            });
            this.dispatchEvent(evt);
        });
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