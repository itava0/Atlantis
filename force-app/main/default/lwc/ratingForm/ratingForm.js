import { LightningElement, api, wire, track } from "lwc";
import { refreshApex } from "@salesforce/apex";
import { deleteRecord, updateRecord } from "lightning/uiRecordApi";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import PROPERTY_OBJECT from "@salesforce/schema/Property__c";
import STREET_FIELD from "@salesforce/schema/Property__c.Billing_Street__c";
import CITY_FIELD from "@salesforce/schema/Property__c.Billing_City__c";
import OVERALL_SCORE_FIELD from "@salesforce/schema/Property__c.Score__c";
import OVERALL_RATING_FIELD from "@salesforce/schema/Property__c.Rating__c";
import RATING_COUNT_FIELD from "@salesforce/schema/Property__c.Rating_Count__c";
import RATING_OBJECT from "@salesforce/schema/Rating__c";
import SCORE_FIELD from "@salesforce/schema/Rating__c.Score__c";
import REVIEW_FIELD from "@salesforce/schema/Rating__c.Review__c";
import ID_FIELD from "@salesforce/user/Id";
import getUniqueRating from "@salesforce/apex/getProperties.getUniqueRating";
import getSingleProperty from "@salesforce/apex/getProperties.getSingleProperty";

export default class RatingForm extends LightningElement {
  propertyObj = PROPERTY_OBJECT;
  street = STREET_FIELD;
  city = CITY_FIELD;
  overallScore = OVERALL_SCORE_FIELD;
  overallRating = OVERALL_RATING_FIELD;
  countRating = RATING_COUNT_FIELD;
  userId = ID_FIELD;
  @api recordId;
  @track ratingCount;
  @track error;

  // Tracking information from wired queries
  @track ratingId = "";
  @track wiredRatings = [];
  @track ratings = [];
  @track wiredProperties = [];
  @track properties = [];

  // Various rating status information
  ratingObj = RATING_OBJECT;
  hasRating = false;
  wasDeleted = false;
  fields = [SCORE_FIELD, REVIEW_FIELD];
  score = SCORE_FIELD;
  review = REVIEW_FIELD;
  currentScore;
  currentReview;

  // Get Rating to Update or Delete
  @wire(getUniqueRating, { propId: "$recordId", usrId: "$userId" })
  getUniqueRating(result) {
    this.wiredRatings = result;

    if (result.data) {
      this.ratings = result.data;
      if (this.ratings.length > 0) {
        this.hasRating = true;
        this.ratingId = this.ratings[0].Id;
        this.error = undefined;
      }
    } else if (result.error) {
      this.error = result.error;
      this.ratings = [];
    }
  }

  // Get Object of Rated Property to Refresh
  @wire(getSingleProperty, { propId: "$recordId" }) getSingleProperty(result) {
    this.wiredProperties = result;
    if (result.data) {
      this.properties = result.data;
      this.error = undefined;
    } else if (result.error) {
      this.error = result.error;
      this.properties = [];
    }
  }

  // Update rating score
  handleScoreChange(event) {
    this.currentScore = event.target.value;
  }

  // Update review
  handleReviewChange(event) {
    this.currentReview = event.target.value;
  }

  // Update displayed rating for property
  updateRecordView(recordId) {
    updateRecord({ fields: { Id: recordId } });
  }

  // Insert/update form submission
  handleSubmit(event) {
    if (this.hasRating) {
      // When updating existing rating
      event.preventDefault();

      const formFields = event.detail.fields;
      formFields.Score__c = this.currentScore;
      formFields.Review__c = this.currentReview;
      this.template.querySelector("lightning-record-edit-form").update(formFields);
    } else {
      // When submitting new rating
      event.preventDefault();

      const formFields = event.detail.fields;
      formFields.Property__c = this.recordId;
      formFields.User__c = this.userId;
      formFields.Score__c = this.currentScore;
      formFields.Review__c = this.currentReview;

      this.template.querySelector("lightning-record-edit-form").submit(formFields);
    }
  }

  // Insert/update form success
  handleSuccess(event) {
    if (this.hasRating) {
      // When updating existing rating
      const evt = new ShowToastEvent({
        title: "Rating updated",
        variant: "success"
      });
      this.dispatchEvent(evt);
    } else {
      // When submitting new rating
      const evt = new ShowToastEvent({
        title: "Rating submitted",
        variant: "success"
      });
      this.ratingId = event.detail.id;
      this.dispatchEvent(evt);
      this.wasDeleted = false;
      this.hasRating = true;
    }
  }

  // Delete form submission
  handleDelete() {
    // Delete Rating
    deleteRecord(this.ratingId)
      .then(() => {
        // On success
        const toastEvt = new ShowToastEvent({
          title: "Rating deleted",
          variant: "error"
        });
        this.dispatchEvent(toastEvt);
        refreshApex(this.wiredProperties);
        this.updateRecordView(this.recordId);
        this.wasDeleted = true;
        this.hasRating = false;
      })
      .catch((error) => {
        // On error
        const toastEvt = new ShowToastEvent({
          title: "Error deleting rating",
          message: error.message,
          variant: "warning"
        });
        this.dispatchEvent(toastEvt);
      });
  }
}