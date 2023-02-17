import { LightningElement , wire, track } from 'lwc';
import { getRecord, getFieldValue } from "lightning/uiRecordApi";
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
//import CONTACT_ID from '@salesforce/schema/Contact.Id'
import CONTACT_ID from '@salesforce/schema/User.ContactId'
import CONTACT_NAME from '@salesforce/schema/Contact.Name'
import CONTACT_EMAIL from '@salesforce/schema/Contact.Email'
import ACCOUNT_ID from '@salesforce/schema/Contact.AccountId'
import USER_ID from '@salesforce/user/Id';
import getProperties from '@salesforce/apex/MaintenanceFormHandler.getProperties'
import createCase from '@salesforce/apex/MaintenanceFormHandler.createCase'




export default class MaintenanceRequestForm extends LightningElement {
    
    showForm=true;
    hasProperties=false;
    conId;
    accId;
    conEmail;
    conName;
    list = [];
    subject = "";
    desc = "";
    inputType = "";
    @track item = {
        label: "",
        value: "",
    };
    @wire(getRecord, { recordId: USER_ID, fields: [CONTACT_ID] }) user;
    @wire(getRecord, { recordId: '$contactId', fields: [CONTACT_NAME, CONTACT_EMAIL, ACCOUNT_ID] }) contact;
    //@wire(getRecord, { recordId: '$accountId', fields: []}) account;
    @wire(getProperties, { accountId: '$accountId' })
    accountProperties(records) {
        if(records.data) {
            //console.log("If Data");
            // console.log(records);
            // console.log(records.data);
            this.properties = records.data;
            //console.log(this.properties);
            this.hasProperties = true;
            //console.log(this.accountId());
        }
        else {
            console.log("Get account properties error");
        }
    }
    

    get contactId() {
        // console.log(USER_ID);
        // console.log(this.user.data);
        // this.conId = getFieldValue(this.user.data, CONTACT_ID);
        this.conId = getFieldValue(this.user.data, CONTACT_ID);
        return getFieldValue(this.user.data, CONTACT_ID);
    }

    get contactName() {
        this.conName = getFieldValue(this.contact.data, CONTACT_NAME);
        return getFieldValue(this.contact.data, CONTACT_NAME);
    }
    
    get contactEmail() {
        this.conEmail = getFieldValue(this.contact.data, CONTACT_EMAIL);
        return getFieldValue(this.contact.data, CONTACT_EMAIL);
    }

    get accountId() {
        //console.log(getFieldValue(this.contact.data, ACCOUNT_ID));
        this.accId = getFieldValue(this.contact.data, ACCOUNT_ID);
        return getFieldValue(this.contact.data, ACCOUNT_ID);
    }

    get pickList() {
        // console.log(this.properties);
        // console.log("Entering picklist")
        for(let i = 0; i < this.properties.length; i += 1) {
            // console.log("In loop", i);
            // console.log(this.properties[i]);
            // console.log(this.list);
            this.list = [...this.list, {
                label: String(this.properties[i].Billing_Street__c),
                value: String(this.properties[i].Id)
            }];
            // console.log(this.list);
        }
        return this.list;
    }

    pickListChange(e) {
        this.location = e.detail.value;
    }

    get typePickList() {
        return [
            { label: 'Mechanical', value: 'Mechanical' },
            { label: 'Electrical', value: 'Electrical' },
            { label: 'Electronic', value: 'Electronic' },
            { label: 'Structural', value: 'Structural' },
            { label: 'Other', value: 'Other' },
        ];
    }

    typePickListChange(event) {
        this.inputType = event.detail.value;
    }

    get todaysDate() {
        let rightNow = new Date();

        // Adjust for the user's time zone
        rightNow.setMinutes(
            new Date().getMinutes() - new Date().getTimezoneOffset()
        );

        // Return the date in "YYYY-MM-DD" format
        return rightNow.toLocaleDateString('en-US');//().slice(0,10);
        //console.log(yyyyMmDd); // Displays the user's current date, e.g. "2020-05-15"
    }

    subjectHandler(e) {
        this.subject = e.target.value;
    }

    descriptionHandler(e) {
        this.desc = e.target.value;
    }

    submitForm() {
        if(this.subject == null || this.subject === "" || this.desc == null || this.desc === "" || this.inputType == null || this.inputType === "") {
            const evt = new ShowToastEvent({
                title: "Error!",
                message: "Must fill all required fields",
                variant: "error",
                mode: "pester"
            });
            this.dispatchEvent(evt);
        }
        else{
            createCase({
                newContactId: this.conId,
                newAccountId: this.accId,
                newPropertyId: this.location,
                newEmail: this.conEmail,
                newName: this.conName,
                newSubject: this.subject,
                newDescription: this.desc,
                newType: this.inputType
            })
            .then((response) => {
                console.log("Submit Success")
                this.showForm=false;
            })
            .catch((error) =>{
                console.log("Submit Error")
            })
        }
    }

    newForm() {
        this.list = [];
        this.showForm=true;
    }
}