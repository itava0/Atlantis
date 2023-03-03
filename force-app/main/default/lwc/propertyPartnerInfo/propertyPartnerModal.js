import { api } from 'lwc';
import LightningModal from 'lightning/modal';
import postUserInfo from '@salesforce/apex/Users.postUserInfo';

export default class PropertyPartnerModal extends LightningModal {
    @api content;

    fName = null;
    lName = null;
    email = null;
    phone = null;
    originCompany = null;

    api = {
        CXPW : 'https://smoothstack9-dev-ed.develop.my.site.com/cxpw/services/apexrest/api/properties',
        Mooreland : 'https://smoothstack35-dev-ed.develop.my.site.com/accountportal/services/apexrest/Tour/',
    }

    connectedCallback() {
        this.fName = this.content.firstName
        this.lName = this.content.lastName
        this.email = this.content.email
        this.phone = this.content.phone
        this.originCompany = this.content.originCompany
        let stuff = JSON.parse(JSON.stringify(this.content));
        console.log(stuff);
        console.log(this.fName);
        console.log(this.lName);
        console.log(this.email);
        console.log(this.phone);
    }

    fNameHandler(event) {
        this.fName = event.target.value;
    }

    lNameHandler(event) {
        this.lName = event.target.value;
    }

    emailHandler(event) {
        this.email = event.target.value;
    }

    phoneHandler(event) {
        this.phone = event.target.value;
    }

    handleOkay() {
        let endpoint = this.api[this.originCompany];
        postUserInfo({ firstName: this.fName, lastName: this.lName, email: this.email, phone: this.phone, endpoint: endpoint, propertyId: this.content.propertyId, originCompany: this.originCompany})
        .then(result => {
            console.log(result);
        })
        this.close('okay');
    }
}