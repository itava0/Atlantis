import { LightningElement, api } from "lwc";
import FORM_FACTOR from "@salesforce/client/formFactor";
import { NavigationMixin } from "lightning/navigation";

export default class PropertyTile extends NavigationMixin(LightningElement) {
  @api property;
  formFactor = FORM_FACTOR;
  currentId;
  selected = false;

  // On page load
  connectedCallback() {
    this.selected = false;
  }

  // When mouse leaves property
  handlePropertyDeselected() {
    this.selected = false;
  }

  // When property tile clicked or hovered over
  handlePropertySelected() {
    this.currentId = this.property.Id;
    this.selected = true;
    if (FORM_FACTOR === "Small") {
      // In Phones, navigate to property record page directly
      this[NavigationMixin.Navigate]({
        type: "standard__recordPage",
        attributes: {
          recordId: this.property.Id,
          objectApiName: "Property__c",
          actionName: "view"
        }
      });
    } else {
      // In other devices, send message to other cmps on the page
      const selectedEvent = new CustomEvent("selected", {
        detail: this.property.Id
      });
      this.dispatchEvent(selectedEvent);
    }
  }

  // Navigate to record page
  handleNavigateToRecord() {
    this[NavigationMixin.Navigate]({
      type: "standard__recordPage",
      attributes: {
        recordId: this.property.Id,
        objectApiName: "Property__c",
        actionName: "view"
      }
    });
  }

  // Navigate to lease application page
  navigateToApplicationPage() {
    //set sessionStorage values
    sessionStorage.setItem("id", this.property.Id);

    this[NavigationMixin.Navigate]({
      type: "standard__namedPage",
      attributes: {
        pageName: "application"
      }
    });
  }

  get backgroundImageStyle() {
    return `background-image:url(${this.property.Picture__c})`;
  }
}