import { LightningElement, api } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import PROPERTY_OBJECT from '@salesforce/schema/Property__c'
import STREET_FIELD from '@salesforce/schema/Property__c.Billing_Street__c'
import CITY_FIELD from '@salesforce/schema/Property__c.Billing_City__c'
import OVERALL_SCORE_FIELD from '@salesforce/schema/Property__c.Score__c'
import OVERALL_RATING_FIELD from '@salesforce/schema/Property__c.Rating__c'
import RATING_OBJECT from '@salesforce/schema/Rating__c'
import SCORE_FIELD from '@salesforce/schema/Rating__c.Score__c'
import ID_FIELD from '@salesforce/user/Id';

export default class RatingFormNew extends LightningElement {

    propertyObj = PROPERTY_OBJECT
    street = STREET_FIELD
    city = CITY_FIELD
    overallScore = OVERALL_SCORE_FIELD
    overallRating = OVERALL_RATING_FIELD
    userId = ID_FIELD
    @api recordId

    ratingObj = RATING_OBJECT

    fields = [SCORE_FIELD]
    score = SCORE_FIELD
    currentScore

    // Test Id, Should Be Dynamic
    // recordId = "a02Dn000001HPFsIAO"

    handleScoreChange(event) {
        this.currentScore = event.target.value
    }

    handleSubmit(event) {
        event.preventDefault()

        const formFields = event.detail.fields
        formFields.Property__c = this.recordId
        formFields.User__c = this.userId
        formFields.Score__c = this.currentScore

        this.template.querySelector('lightning-record-edit-form').submit(formFields)
    }

    handleSuccess(event) {
        const evt = new ShowToastEvent({
            title: 'Rating submitted',
            variant: 'success',
        });
        this.dispatchEvent(evt);
    }

    handleError(event) {
        const evt = new ShowToastEvent({
            title: 'Error submitting record',
            message: 'You likely have already submitted a rating. Try refreshing and use update form instead',
            variant: 'error',
        });
        this.dispatchEvent(evt);
    }
}