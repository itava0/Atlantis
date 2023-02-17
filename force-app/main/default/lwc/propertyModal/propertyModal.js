import { api } from 'lwc';
import LightningModal from 'lightning/modal';

export default class PropertyModal extends LightningModal {
    @api content;

    handleClose() {
        this.close();
    }
}