import { api, wire } from 'lwc';
import LightningModal from 'lightning/modal';
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import INSPECTION_OBJECT from '@salesforce/schema/Inspection__c';
import DATETIME_FIELD from '@salesforce/schema/Inspection__c.DateTime__c';
import INSPECTOR_FIELD from '@salesforce/schema/Inspection__c.Inspector__c';
import SUBJECTS_FIELD from '@salesforce/schema/Inspection__c.Subjects__c';
import { publish, MessageContext } from "lightning/messageService";
import INSPECTIONUPDATEDMC from "@salesforce/messageChannel/InspectionUpdated__c";

const DELAY = 350;

export default class UpdateInspection extends LightningModal {
    @api content;
    @api inspectionId;
    
    inspectionObj = INSPECTION_OBJECT;
    dateTimeField = DATETIME_FIELD;
    inspectorField = INSPECTOR_FIELD;
    subjectsField = SUBJECTS_FIELD;

    msgDateTime;
    msgInspector;
    msgSubjects;

    @wire(MessageContext)
    messageContext;

    // If inspection successfully updated
    handleSuccess(event) {
        const fields = event.detail.fields;
        this.msgDateTime = fields.DateTime__c.value;
        this.msgInspector = fields.Inspector__c.value;
        this.msgSubjects = fields.Subjects__c.value;
        const evt = new ShowToastEvent({
            title: "Inspection updated",
            variant: "success"
        });
        this.dispatchEvent(evt);
        this.fireChangeEvent();
        this.handleClose();
    }

    // If error when updating inspection
    handleError(event) {
        console.log("handleError event");
        console.log(JSON.stringify(event.detail));
        const evt = new ShowToastEvent({
            title: "Error updating inspection",
            variant: "error"
        });
        this.dispatchEvent(evt);
    }

    fireChangeEvent() {
        // Debouncing this method: Do not actually fire the event as long as this function is
        // being called within a delay of DELAY. This is to avoid a very large number of Apex
        // method calls in components listening to this event.
        window.clearTimeout(this.delayTimeout);
    
        // Sends variables, primarily for filters, through message channel
        // eslint-disable-next-line @lwc/lwc/no-async-operation
        this.delayTimeout = setTimeout(() => {
            const fields = {
                inspectionId: this.inspectionId,
                dateTime: this.msgDateTime,
                inspector: this.msgInspector,
                subjects: this.msgSubjects,
            };
            publish(this.messageContext, INSPECTIONUPDATEDMC, fields);
        }, DELAY);
    }

    // Close modal
    handleClose() {
        this.close();
    }
}