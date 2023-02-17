import { LightningElement, api } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import getRequest from '@salesforce/apex/ViewMaintenanceHandler.getRequest';
import OBJECT_NAME from '@salesforce/schema/Case';

export default class ViewRequestsModal  extends NavigationMixin(LightningElement) {
    caseId;
    caseItem;
    caseNumber;

    @api modalClass = "slds-modal slds-fade-in-open slds-modal_small";
    @api showmodal = false;

    @api getCase(newId) {
        this.caseId = newId;
        console.log("inserted ",newId, " ", this.caseid);
        getRequest({ caseId: this.caseId })
        .then((response) => {
            console.log(response);
            this.caseItem = response;
            this.caseNumber = this.caseItem.CaseNumber;
        })
        .catch((error) => {
            console.log(error);
        })
    }

    closemodal(event) {
        let ev = new CustomEvent('childmethod');
        this.dispatchEvent(ev);
    }

    viewMore(event) {
        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId: this.caseId,
                objectApiName: 'Case',
                actionName: 'view'
            }
          });
    }
}