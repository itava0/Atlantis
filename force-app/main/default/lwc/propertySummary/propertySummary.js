import { LightningElement, api, wire } from "lwc";
import { getRecord, getFieldValue } from "lightning/uiRecordApi";
import { NavigationMixin } from "lightning/navigation";
import {
  subscribe,
  unsubscribe,
  MessageContext
} from "lightning/messageService";
import PROPERTYSELECTEDMC from "@salesforce/messageChannel/PropertySelected__c";
import NAME_FIELD from "@salesforce/schema/Property__c.Billing_Street__c";
import BED_FIELD from "@salesforce/schema/Property__c.Bedrooms__c";
import BATH_FIELD from "@salesforce/schema/Property__c.Bathrooms__c";
import PRICE_FIELD from "@salesforce/schema/Property__c.Rent__c";
import RATING_FIELD from "@salesforce/schema/Property__c.Rating__c";
import PICTURE_FIELD from "@salesforce/schema/Property__c.Picture__c";

export default class PropertySummary extends NavigationMixin(LightningElement) {
  propertyId;
  propertyFields = [BED_FIELD, BATH_FIELD, PRICE_FIELD, RATING_FIELD];
  subscription = null;

  @wire(MessageContext)
  messageContext;

  @wire(getRecord, {
    recordId: "$propertyId",
    fields: [NAME_FIELD, PICTURE_FIELD]
  })
  property;

  @api
  get recordId() {
    return this.propertyId;
  }

  set recordId(propertyId) {
    this.propertyId = propertyId;
  }

  get propertyName() {
    return getFieldValue(this.property.data, NAME_FIELD);
  }

  get pictureURL() {
    return getFieldValue(this.property.data, PICTURE_FIELD);
  }

  // Susbcribe to message channel
  connectedCallback() {
    this.subscription = subscribe(
      this.messageContext,
      PROPERTYSELECTEDMC,
      (message) => {
        this.handlePropertySelected(message);
      }
    );
  }

  // Unsubscribe from message channel
  disconnectedCallback() {
    unsubscribe(this.subscription);
    this.subscription = null;
  }

  // Update current property based on message channel
  handlePropertySelected(message) {
    this.propertyId = message.propertyId;
  }

  // Navigate to lease application page for current property
  navigateToApplicationPage() {
    //set sessionStorage values
    sessionStorage.setItem("id", this.propertyId);

    this[NavigationMixin.Navigate]({
      type: "standard__namedPage",
      attributes: {
        pageName: "application"
      }
    });
  }

  // Navigate to record page for current property
  handleNavigateToRecord() {
    this[NavigationMixin.Navigate]({
      type: "standard__recordPage",
      attributes: {
        recordId: this.propertyId,
        objectApiName: "Property__c",
        actionName: "view"
      }
    });
  }
}