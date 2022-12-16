import { LightningElement, api } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';

export default class NavButton extends NavigationMixin(LightningElement) {

    @api mapsUrl;

    handleGoogleMapsLink() {
        // console.log(this.mapsUrl);
        // this[NavigationMixin.Navigate](this.mapsUrl);
        window.open(this.mapsUrl);
    }
}