import { LightningElement, api, wire, track } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import getOwnerAccounts from '@salesforce/apex/getProperties.getPropertyOwnerAccounts';

export default class StaffPropertyOwner extends NavigationMixin(LightningElement) {

    @api propertyId;
    @track ownerAccounts = [];
    oneOwner = false;

    // Get owner (or owners) of a given property
    @wire(getOwnerAccounts, { propId: "$propertyId" }) getOwnerAccounts(result) {
        if (result.data) {
            this.ownerAccounts = result.data;
            if (this.ownerAccounts.length == 1) {
                this.oneOwner = true;
            }

            this.error = undefined;
        } else if (result.error) {
            this.error = result.error;
            this.ownerAccounts = undefined;
        }
    }

    // View profile of property owner
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
}