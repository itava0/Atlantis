import { LightningElement , wire, track } from 'lwc';
import { getRecord, getFieldValue } from "lightning/uiRecordApi";
//import CONTACT_ID from '@salesforce/schema/Contact.Id'
import CONTACT_ID from '@salesforce/schema/User.ContactId'
import USER_ID from '@salesforce/user/Id';
import getRequests from '@salesforce/apex/RateMaintenanceHandler.getRequests';
// import RateMaintenanceChild from 'c/RateMaintenanceChild';

export default class RateMaintenance extends LightningElement {

    openModal = false;
    viewSize = 3;
    curPage = 1;
    allRequests = [];
    requests = [];
    leftDisabled = true;
    rightDisabled = false;
    @track reqItem = {
        id: "",
        location: ""
    };
    @wire(getRecord, { recordId: USER_ID, fields: [CONTACT_ID] }) user;
    @wire(getRequests, { conId: '$contactId'})
    conRequests(records){
        console.log("in conRequests");
        if(records.data) {
            for(let i = 0; i < records.data.length; i += 1) {
                console.log(i);
                console.log(records.data);

                this.reqItem = {
                    id: records.data[i].Id,
                    CaseNumber: "Case #" + records.data[i].CaseNumber,
                    CreatedDate: new Date(records.data[i].CreatedDate).toLocaleDateString('en-US'),
                    Subject: records.data[i].Subject,
                }
                console.log("before property");
                if (records.data[i].PropertyId__r == null) {
                    this.reqItem.location = "No location found";
                }
                else {
                    this.reqItem.location = records.data[i].PropertyId__r.Billing_Street__c;
                }
                console.log("before closed date");
                if (records.data[i].ClosedDate == null) {
                    this.reqItem.ClosedDate = "In progress";
                    this.reqItem.Closed = false;
                }
                else {
                    this.reqItem.ClosedDate = new Date(records.data[i].ClosedDate).toLocaleDateString('en-US');
                    this.reqItem.Closed = true;
                }
                if(records.data[i].Description == null) {
                    this.reqItem.Description = "No description available";
                }
                else if (records.data[i].Description.length <= 128) {
                    this.reqItem.Description = records.data[i].Description;
                }
                else {
                    this.reqItem.Description = records.data[i].Description.substr(0,128) + "...";
                }
                this.allRequests = [...this.allRequests,this.reqItem];
            }
            //this.requests = records.data;
            console.log(this.allRequests);
            if(this.allRequests.length <= this.viewSize) {
                this.requests = this.allRequests;
                this.rightDisabled = true;
            }
            else {
                console.log("enter?")
                this.requests = this.allRequests.slice((this.curPage-1)*this.viewSize,this.curPage*this.viewSize);
                console.log(this.requests);
            }
        }
        else {
            console.log("Get requests error");
        }
    }

    left() {
        this.curPage -= 1;
        if(this.curPage == 1) {
            this.leftDisabled = true;
        }
        this.requests = this.allRequests.slice((this.curPage-1)*this.viewSize,this.curPage*this.viewSize);
        this.rightDisabled = false;
    }

    right() {
        this.curPage += 1;
        if(this.allRequests.length <= this.curPage*this.viewSize) {
            this.requests = this.allRequests.slice((this.curPage-1)*this.viewSize);
            this.rightDisabled = true;
        }
        else {
            this.requests = this.allRequests.slice((this.curPage-1)*this.viewSize,this.curPage*this.viewSize);
        }
        this.leftDisabled = false;
    }

    get contactId() {
        this.conId = getFieldValue(this.user.data, CONTACT_ID);
        return getFieldValue(this.user.data, CONTACT_ID);
    }

    rate(event) {
        this.openModal = true;
        console.log(event.target.dataset.key);
        this.template.querySelector("c-rate-maintenance-modal").getCase(String(event.target.dataset.key));
    }

    handleCloseModal() {
        this.openModal = false;
    }

}