import { LightningElement, api } from 'lwc';
import ModalMapMain from 'c/modalMapMain';

export default class ModalMap extends LightningElement {
    // Test ID and type, will eventually be ID of property on record page and inputted type(s)
    @api propertyId;

    @api
    get recordId() {
        return this.propertyId;
    }

    set recordId(propertyId) {
        this.propertyId = propertyId;
    }

    // Create modal
    async loadModal() {
        await ModalMapMain.open({
            size: 'medium',
            description: 'description',
            content: 'content',
            propertyId: this.propertyId,
            recordId: this.recordId
        })
    }
}