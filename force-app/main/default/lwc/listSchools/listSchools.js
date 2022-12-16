import { LightningElement, track } from 'lwc';
import getSchools from '@salesforce/apex/FindNearbySchools.getSchools';

export default class ListSchools extends LightningElement {
    
    curPostalCode;
    evtPostalCode;
    showTable = false;
    @track schools = [];
    @track error;

    // Postal code input field
    handlePostalCodeChange(event) {
        this.curPostalCode = event.target.value;
    }

    getNearbySchools() {
        // Shows table once button is clicked
        this.showTable = true;
        this.evtPostalCode = this.curPostalCode;
        
        // Apex method to get schools given postal code, using US Real Estate API
        getSchools({ postalCode: this.evtPostalCode })
        .then((result) => {
            this.schools = result;
            // console.log(this.schools.length);
            // for (let i = 0; i < this.schools.length; i++) {
            //     console.log(this.schools[i].name);
            // }
            this.error = undefined;
        })
        .catch((error) => {
            this.error = error;
            console.log(error.message);
            this.schools = undefined;
        });
    };

}