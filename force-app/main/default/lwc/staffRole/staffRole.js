import { LightningElement, api, wire, track } from 'lwc';
import getStaffRole from '@salesforce/apex/getProperties.getStaffRole';

export default class StaffRole extends LightningElement {

    @api propertyId;
    @api accountId;
    @track role;
    @track error;

    // Get role of assignment, given property and staff account
    @wire(getStaffRole, { propId: "$propertyId", accId: "$accountId" }) getStaffRole(result) {
        if (result.data) {
            this.role = result.data[0].Role__c;
            this.error = undefined;
        } else if (result.error) {
            this.error = result.error;
            this.role = undefined;
        }
    }
}