import { LightningElement, api } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';

export default class NavButton extends NavigationMixin(LightningElement) {

    @api propertyId;

    // Navigate to record given an Id
    handleNavigateToRecord() {
        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId: this.propertyId,
                objectApiName: 'Property__c',
                actionName: 'view'
            }
        });
    }
}