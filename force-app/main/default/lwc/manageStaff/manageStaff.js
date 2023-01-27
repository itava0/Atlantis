import { LightningElement, api, wire, track } from 'lwc';
import getStaffMembers from "@salesforce/apex/getProperties.getStaffMembers";

export default class ManageStaff extends LightningElement {
    @api recordId;
    @track error;
    @track staff = [];
    hasStaff = false;

    @wire(getStaffMembers, { propId: "$recordId" }) getStaffMembers(result) {
        if (result.data) {
            this.staff = result.data;
            if (this.staff.length > 0) {
                this.hasStaff = true;
            }
            for (let i = 0; i < this.staff.length; i++) {
                console.log("STAFF:", this.staff[i].Account__r.Name, "@", this.staff[i].Property__r.Name);
            }
            this.error = undefined;
        } else if (result.error) {
            this.error = result.error;
            this.staff = undefined;
        }
    }
}