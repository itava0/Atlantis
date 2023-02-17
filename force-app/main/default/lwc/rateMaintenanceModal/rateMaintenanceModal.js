import { LightningElement, api } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import updateRequest from '@salesforce/apex/RateMaintenanceHandler.updateRequest'

export default class RateMaintenanceModal extends LightningElement {
    //default size of the modal has been kept as large 
    //other possible values are medium and small
    @api modalClass = "slds-modal slds-fade-in-open slds-modal_large";
    @api showmodal = false;
    caseid;
    done=false;
    timeliness = 0;
    professionalism = 0;
    quality = 0;
    overall = 0;
  
    @api getCase(newId) {
        this.caseid = newId;
        console.log("inserted ",newId, " ", this.caseid);
    }

    rating(event) {
        if (event.target.name === "Timeliness") {
            this.timeliness = parseInt(event.target.value);
            console.log(this.caseid)
        }
        if (event.target.name === "Professionalism") {
            this.professionalism = parseInt(event.target.value);
            console.log(this.caseid)
        }
        if (event.target.name === "Quality") {
            this.quality = parseInt(event.target.value);
            console.log(this.caseid)
        }
        if (event.target.name === "Overall") {
            this.overall = parseInt(event.target.value);
            console.log(this.caseid)
        }
    }

    submit() {
        if(this.timeliness == 0 || this.timeliness == null ||
        this.professionalism == 0 || this.professionalism == null ||
        this.quality == 0 || this.quality == null ||
        this.overall == 0 || this.overall == null) {
            const evt = new ShowToastEvent({
                title: "Error!",
                message: "All fields must be filled out",
                variant: "error",
                mode: "pester"
            });
            this.dispatchEvent(evt);
        }
        else {
            console.log(this.caseid);
            updateRequest({
                caseId: this.caseid,
                newTimeliness: this.timeliness,
                newProfessionalism: this.professionalism,
                newQuality: this.quality,
                newOverall: this.overall
            })
            .then((response) => {
                console.log(response);
                this.done = true;
                console.log(this.done);
            })
            .catch((error) => {
                console.log(error);
            })
        }
    }

    closemodal(event) {
        let ev = new CustomEvent('childmethod');
        this.dispatchEvent(ev);    
        this.done=false;
    }

}