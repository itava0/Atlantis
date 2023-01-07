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
import ID_FIELD from "@salesforce/user/Id";
import getRatingCount from "@salesforce/apex/getProperties.getRatingCount";
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

  @track ratingId = "";
  @track wiredRatings = [];
  @track ratings = [];
  @track wiredProperties = [];
  @track properties = [];

  ratingObj = RATING_OBJECT;
  hasRating = false;
  wasDeleted = false;

  fields = [SCORE_FIELD];
  score = SCORE_FIELD;
  currentScore;

  // Test Id, Should Be Dynamic
  // recordId = "a02Dn000001HPFsIAO"

  // Get Rating Count from Property Id
  @wire(getRatingCount, { propId: "$recordId" }) getRatingCount(result) {
    if (result.data) {
      this.ratingCount = result.data;
      // console.log(this.recordId, "has", this.ratingCount);
      if (this.ratingCount > 0) {
        this.hasRating = true;
      }
      this.error = undefined;
    } else if (result.error) {
      this.error = result.error;
      this.ratingCount = null;
    } else {
      this.ratingCount = 0;
      // console.log(this.recordId, "has", this.ratingCount);
    }
  }

  // Get Rating to Update or Delete
  @wire(getUniqueRating, { propId: "$recordId", usrId: "$userId" })
  getUniqueRating(result) {
    this.wiredRatings = result;

    if (result.data) {
      this.ratings = result.data;
      if (this.ratings.length > 0) {
        console.log("RATINGID", this.ratings[0].Id);
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
      console.log("PROPERTYID", this.properties[0].Id);
      console.log("SCORE", this.properties[0].Score__c);
      this.error = undefined;
    } else if (result.error) {
      this.error = result.error;
      this.properties = [];
    }
  }

  handleScoreChange(event) {
    this.currentScore = event.target.value;
    // console.log(this.recordId, this.currentScore);
  }

  updateRecordView(recordId) {
    updateRecord({ fields: { Id: recordId } });
  }

  handleSubmit(event) {
    if (this.hasRating) {
      // When updating existing rating
      event.preventDefault();

      const formFields = event.detail.fields;
      formFields.Score__c = this.currentScore;
      this.template.querySelector("lightning-record-edit-form").update(formFields);
    } else {
      // When submitting new rating
      event.preventDefault();

      const formFields = event.detail.fields;
      formFields.Property__c = this.recordId;
      formFields.User__c = this.userId;
      formFields.Score__c = this.currentScore;

      this.template.querySelector("lightning-record-edit-form").submit(formFields);
    }
  }

  handleSuccess(event) {
    if (this.hasRating) {
      // When updating existing rating
      const evt = new ShowToastEvent({
        title: "Rating updated",
        // message: event.detail.id,
        variant: "success"
      });
      // this.ratingId = event.detail.id;
      this.dispatchEvent(evt);
    } else {
      // When submitting new rating
      const evt = new ShowToastEvent({
        title: "Rating submitted",
        // message: event.detail.id,
        variant: "success"
      });
      this.ratingId = event.detail.id;
      this.dispatchEvent(evt);
      this.wasDeleted = false;
      this.hasRating = true;
    }
  }

  handleDelete() {
    // Delete Rating
    deleteRecord(this.ratingId)
      .then(() => {
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
        const toastEvt = new ShowToastEvent({
          title: "Error deleting rating",
          message: error.message,
          variant: "warning"
        });
        this.dispatchEvent(toastEvt);
      });
  }
}