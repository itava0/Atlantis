import { LightningElement, api } from "lwc";
import leaseContact from "@salesforce/apex/LeaseStatusController.LeaseStatusController";
import submitCancellation from "@salesforce/apex/LeaseStatusController.CreateCase";

export default class CancelLease extends LightningElement {
  @api recordId;
  showform = false;
  showmessage = false;
  showcard = false;
  showbutton = true;
  accountName;
  propertyId;
  message;

  handleOpen() {
    this.showform = true;
    this.showbutton = false;
    leaseContact({ lease: this.recordId })
      .then((resp) => {
        console.log(resp);
        this.accountName = resp.AccountId;
        this.propertyId = resp.Property__c;
        this.showcard = true;
      })
      .catch((err) => {
        console.log("error message", err);
      });
  }

  descriptionHandler(e) {
    this.message = e.target.value;
  }

  s;
  submit() {
    submitCancellation({ accId: this.accountName, des: this.message, proId: this.propertyId })
      .then((resp) => {
        console.log("Created a the case", resp);
      })
      .catch((err) => {
        console.log("Error message", err);
      });
    this.showmessage = true;
    this.showform = false;
  }
}