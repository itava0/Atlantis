import { LightningElement, api } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';

export default class NavButton extends NavigationMixin(LightningElement) {

    @api mapsUrl;

    // Open Google Maps given a URL
    handleGoogleMapsLink() {
        window.open(this.mapsUrl);
    }
}