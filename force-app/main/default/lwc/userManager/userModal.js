import { api } from "lwc";
import { updateRecord } from "lightning/uiRecordApi";
import LightningModal from "lightning/modal";

export default class UserModal extends LightningModal {
  @api record;
  recordTypeId = "";
  firstName = "";
  lastName = "";
  active;
  @api recordTypeOptions = [];

  connectedCallback() {
    this.active = this.record.IsActive;
    console.log("Active", this.active);
    this.firstName = this.record.Name.split(" ")[0];
    this.lastName = this.record.Name.split(" ")[1];
    this.recordTypeId = this.record.Account.RecordTypeId;
    this.recordTypeOptions.forEach((recordType) => {
      if (recordType.value === this.recordTypeId) {
        console.log("RecordType", recordType);
      }
    });
    console.log("RecordTypeId", this.recordTypeId);
    console.log("RecordTypeOptions", this.recordTypeOptions);
  }

  handleRecordTypeChange(event) {
    this.recordTypeId = event.target.value;
    console.log("RecordTypeId", this.recordTypeId);
  }

  handleFirstNameChange(event) {
    this.firstName = event.target.value;
    console.log("FirstName", this.firstName);
  }

  handleLastNameChange(event) {
    this.lastName = event.target.value;
    console.log("LastName", this.lastName);
  }

  handleActiveChange(event) {
    this.active = event.target.checked;
    console.log("Active", this.active);
  }

  handleSave() {
    const userFields = {
      Id: this.record.Id,
      FirstName: this.firstName,
      LastName: this.lastName,
      IsActive: this.active
    };

    const accountFields = {
      Id: this.record.AccountId,
      RecordTypeId: this.recordTypeId
    };

    updateRecord({ fields: userFields });
    updateRecord({ fields: accountFields });

    this.close({ ...userFields, RecordTypeId: this.recordTypeId });
  }
}