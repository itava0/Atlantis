import { LightningElement, api } from 'lwc';

export default class PropertyInfoCard extends LightningElement {
    // From parent (property or portfolio page component), get values from property
    @api propertyId;
    @api name;
    @api street;
    @api city;
    @api type;
    @api status;
    @api state;
    @api postalCode;
    @api lat;
    @api lon;
    @api country;
    @api rent;
    @api marketPrice;
    @api dateListed;
    @api daysOnMarket;
    @api bedrooms;
    @api bathrooms;
    @api picture;
    isAvailable;

    connectedCallback() {
        // Property status will have different colors depending on status
        this.isAvailable = this.status == 'Available' ? true : false;
    }

}