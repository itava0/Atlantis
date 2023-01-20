import { LightningElement, api } from 'lwc';

export default class PropertyDetailNav extends LightningElement {
    @api propertyId;

    @api
    get recordId() {
        return this.propertyId;
    }

    set recordId(propertyId) {
        this.propertyId = propertyId;
    }
}