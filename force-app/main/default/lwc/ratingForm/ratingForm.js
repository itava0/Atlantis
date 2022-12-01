import { LightningElement, api } from 'lwc';
import { deleteRecord } from 'lightning/uiRecordApi'
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { NavigationMixin } from 'lightning/navigation';
import RATING_OBJECT from '@salesforce/schema/Rating__c';
import USER_FIELD from '@salesforce/schema/Rating__c.User__c';
import PROPERTY_FIELD from '@salesforce/schema/Rating__c.Property__c';
import SCORE_FIELD from '@salesforce/schema/Rating__c.Score__c';
import ID_FIELD from '@salesforce/user/Id';

export default class RatingForm extends NavigationMixin(LightningElement) {
    ratingObj = RATING_OBJECT
    user = USER_FIELD
    property = PROPERTY_FIELD
    score = SCORE_FIELD
    @api recordId
    userId = ID_FIELD

    // Test Id, Need Way to Access Based on Experience Record Page
    // recordId = "a00Dn000002v3FUIAY"

    handleSuccess(event) {
        const evt = new ShowToastEvent({
            title: 'Rating updated',
            variant: 'success',
        });
        this.dispatchEvent(evt);
    }

    handleError(event) {
        const evt = new ShowToastEvent({
            title: 'Error updating record',
            variant: 'error',
        });
        this.dispatchEvent(evt);
    }

    // Delete Rating
    handleDelete() {

        deleteRecord(this.recordId)
        .then(() => {
            const toastEvt = new ShowToastEvent({
                title: 'Rating deleted',
                variant: 'warning'
            })
            this.dispatchEvent(toastEvt)
            this[NavigationMixin.Navigate]({
                type: 'standard__objectPage',
                attributes: {
                    objectApiName: 'Property__c',
                    actionName: 'home',
                },
            });
        })
        .catch(error =>{
            const toastEvt = new ShowToastEvent({
                title: 'Error deleting rating',
                message: error.message,
                variant: 'error'
            })
            this.dispatchEvent(toastEvt)
        })
    }

}