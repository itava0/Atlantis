import { LightningElement } from 'lwc';

export default class PricingTable extends LightningElement {
    openModal = false;

    showModal(event) {
        this.openModal = true;
        console.log(event.target.dataset.key);
        this.template.querySelector("c-pricing-table-modal").getPlan(String(event.target.dataset.key));
        //console.log(event.detail.row.Id);
        //this.template.querySelector("c-view-requests-modal").getCase(event.detail.row.Id);
    }

    handleCloseModal() {
        this.openModal = false;
    }

    testing(event){
        
        showModal(event);
    }
}