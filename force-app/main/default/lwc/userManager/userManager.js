import { LightningElement } from "lwc";
import { updateRecord } from "lightning/uiRecordApi";
import UserModal from "./userModal";
import getUsers from "@salesforce/apex/Users.getUsers";
import getRecordTypes from "@salesforce/apex/Users.getRecordTypes";

export default class UserManager extends LightningElement {
  afterUsers = [];
  users = [];
  sortedBy;
  sortedDirection;
  actions = [
    { label: "Edit", name: "edit" },
    { label: "Disable/Enable", name: "toggle" }
  ];

  recordTypes = {
    "012Dn000000gfNnIAI": {
      recordTypeName: "Tenant",
      isPersonAccount: false
    },
    "012Dn000000giXgIAI": {
      recordTypeName: "Property Owner",
      isPersonAccount: false
    },
    "012Dn000000gisuIAA": {
      recordTypeName: "Person Account",
      isPersonAccount: true
    },
    "012Dn000000gsCuIAI": {
      recordTypeName: "Property Owner",
      isPersonAccount: true
    },
    "012Dn000000gsCzIAI": {
      recordTypeName: "Tenant",
      isPersonAccount: true
    },
    "012Dn000000hTNfIAM": {
      recordTypeName: "Staff",
      isPersonAccount: false
    },
    "012Dn000000hweoIAA": {
      recordTypeName: "Staff",
      isPersonAccount: true
    }
  };

  isPersonPicklist = [
    { label: "Person Account", value: "012Dn000000gisuIAA" },
    { label: "Property Owner", value: "012Dn000000gsCuIAI" },
    { label: "Tenant", value: "012Dn000000gsCzIAI" },
    { label: "Staff", value: "012Dn000000hweoIAA" }
  ];

  notPersonPicklist = [
    { label: "Tenant", value: "012Dn000000gfNnIAI" },
    { label: "Property Owner", value: "012Dn000000giXgIAI" },
    { label: "Staff", value: "012Dn000000hTNfIAM" }
  ];

  columns = [
    { label: "Name", fieldName: "Name", sortable: true },
    { label: "Email", fieldName: "Email", type: "email", sortable: true },
    { label: "Record Type", fieldName: "recordType", sortable: true },
    { label: "Active", fieldName: "IsActive", type: "boolean", sortable: true },
    { type: "action", typeAttributes: { rowActions: this.actions } }
  ];

  connectedCallback() {
    getRecordTypes()
      .then((result) => {
        this.recordTypes = result;
        getUsers()
          .then((userresult) => {
            this.users = userresult;
            this.buildTable();
          })
          .catch((error) => {
            console.log(error);
          });
      })
      .catch((error) => {
        console.log(error);
      });
  }

  // Build the table with the record type name
  buildTable() {
    console.log("RecordTypes", this.recordTypes);
    console.log(this.users);
    // Loop through the users and add the record type name to the object
    this.afterUsers = [];
    this.users
      .forEach((user) => {
        this.afterUsers = [
          ...this.afterUsers,
          { ...user, recordType: this.recordTypes[user.Account.RecordTypeId] }
        ];
      })
      .then(() => {
        console.log("AfterUsers", this.afterUsers);
      });
  }

  handleRowAction(event) {
    const actionName = event.detail.action.name;
    const row = event.detail.row;

    switch (actionName) {
      case "edit":
        this.editRow(row);
        break;
      case "toggle":
        this.toggleRow(row);
        break;
      default:
    }
    console.log("ID:", row.Id);
    console.log("AccountID:", row.AccountId);
    console.log("RecordType:", row.recordType);
    console.log("Action", actionName);
  }

  async editRow(row) {
    const recordTypeId = row.Account.RecordTypeId;
    const recordTypeOptions = this.recordTypes[recordTypeId].isPersonAccount
      ? this.notPersonPicklist
      : this.isPersonPicklist;
    const result = await UserModal.open({
      // `label` is not included here in this example.
      // it is set on lightning-modal-header instead
      size: "medium",
      description: "Accessible description of modal's purpose",
      record: row,
      recordTypeOptions: recordTypeOptions,
      recordTypeId: recordTypeId
    });
    // if modal closed with X button, promise returns result = 'undefined'
    // if modal closed with OK button, promise returns result = 'okay'
    let parsedResult = JSON.parse(JSON.stringify(result));
    let name = parsedResult.FirstName + " " + parsedResult.LastName;
    console.log(parsedResult);
    console.log(this.recordTypes[parsedResult.RecordTypeId].recordTypeName);
    if (parsedResult) {
      this.afterUsers = this.afterUsers.map((user) => {
        if (user.Id === parsedResult.Id) {
          return {
            ...user,
            Name: name,
            IsActive: parsedResult.IsActive,
            recordType: this.recordTypes[parsedResult.RecordTypeId]
          };
        }
        return user;
      });
    }
  }

  // Toggle the active status
  toggleRow(row) {
    let parseData = JSON.parse(JSON.stringify(row));
    console.log("Toggle", parseData);
    try {
      this.afterUsers = this.afterUsers.map((user) => {
        if (user.Id === parseData.Id) {
          return { ...user, IsActive: !user.IsActive };
        }
        return user;
      });
      updateRecord({
        fields: { Id: parseData.Id, IsActive: !parseData.IsActive }
      });
    } catch (e) {
      console.log(e);
    }
  }

  // Handle the sort event
  handleSort(event) {
    var fieldName = event.detail.fieldName;
    var sortDirection = event.detail.sortDirection;
    console.log("Sort", fieldName, sortDirection);
    // Assign the latest attribute with the sorted column fieldName and sorted direction
    this.sortedBy = fieldName;
    this.sortedDirection = sortDirection;
    this.sortData(fieldName, sortDirection);
  }

  sortData(fieldName, sortDirection) {
    // Serialize the data before calling sort function
    let parseData = JSON.parse(JSON.stringify(this.afterUsers));
    // Returns the value stored in the field
    let keyValue = (a) => {
      return a[fieldName];
    };
    // Depending on the sorting direction, this would
    // either arrange the value in ascending or descending order
    let isReverse = sortDirection === "asc" ? 1 : -1;
    parseData.sort((x, y) => {
      x = keyValue(x) ? keyValue(x) : "";
      y = keyValue(y) ? keyValue(y) : "";
      return isReverse * ((x > y) - (y > x));
    });
    this.afterUsers = parseData;
  }
}