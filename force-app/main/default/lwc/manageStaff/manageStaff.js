import { LightningElement, api, wire, track } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import getStaffMembers from "@salesforce/apex/getProperties.getStaffMembers";

export default class ManageStaff extends NavigationMixin(LightningElement) {
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

    // View profile of staff member
    viewProfile(event) {
        // console.log(event.target.value);
        // console.log("VIEW PROFILE");
        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId: event.target.value,
                objectApiName: 'User',
                actionName: 'view'
            }
        });
    }

    // Switch staff member's assigned role
    switchRole() {
        console.log("SWITCH ROLE");
    }

    // Reassign staff member to different property
    reassign() {
        console.log("REASSIGN");
    }

    // Remove staff member from property
    remove() {
        console.log("REMOVE");
    }

    // Assign staff members to a property without staff
    assignStaff() {
        console.log("ASSIGN");
    }
}