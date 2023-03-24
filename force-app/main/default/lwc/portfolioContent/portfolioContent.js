import { LightningElement, api } from 'lwc';

export default class PortfolioContent extends LightningElement {
    @api searchedProperties;

    // Method called from parent class, updates properties after a search or a sort
    @api updateProperties(newProperties) {
        this.searchedProperties = newProperties;
    }
}