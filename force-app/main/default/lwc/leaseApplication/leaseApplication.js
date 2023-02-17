import { LightningElement } from 'lwc';
import insertTenant from '@salesforce/apex/ProspectiveTenant.insertTenant';
import getToken from '@salesforce/apex/ProspectiveTenant.getToken';
import getCreditScore from '@salesforce/apex/ProspectiveTenant.getCreditScore';
import getProperty from '@salesforce/apex/PdfGenerator.getProperty';
import IMAGES from "@salesforce/resourceUrl/check_logo";


export default class LeaseApplication extends LightningElement {
    firstName;
    lastName;
    phoneNumber;
    socialSecurity;
    dateOfBirth;
    email;
    driverLicense;
    monthlyIncome;
    leaseTerm;
    moveInDate;
    data;
    veteran;
    rent;
    logo = IMAGES;
    fullname = `${this.firstName} ${this.lastName}`;
    propertyId;
    show = true;

    firstNameHandler(e) {
        this.firstName = e.target.value;
    }

    lastNameHandler(e) {
        this.lastName = e.target.value;
    }

    phoneHandler(e) {
        this.phoneNumber = e.target.value;
    }

    socialSecurityHandler(e) {
        this.socialSecurity = e.target.value;
    }

    dateBirthHandler(e) {
        this.dateOfBirth = e.target.value;
    }

    emailHandler(e) {
        this.email = e.target.value;
    }

    driverLicenseHandler(e) {
        this.driverLicense = e.target.value;
    }

    monthlyIncomeHandler(e) {
        this.monthlyIncome = e.target.value;
    }

    leaseTermHandler(e) {
        this.leaseTerm = e.target.value;
    }

    moveInHandler(e) {
        this.moveInDate = e.target.value;
    }

    get options() {
        return [
            { label: 'Yes', value: 'yes' },
            { label: 'No', value: 'no' }
        ];
    }

    handleChange(e) {
        this.veteran = e.detail.value;
    }



    connectedCallback() {
        if(sessionStorage.getItem('id')){
           
            this.propertyId = sessionStorage.getItem('id');

            sessionStorage.clear();
        }


        getToken().then(response => {
            this.getScore(response)
        }).catch(error => console.log('error message', error));

        this.handleProperty(this.propertyId);

    }

    getScore(key) {
        console.log(key);
        getCreditScore({ token: key }).then(response => {
            if(response) {
              this.data = response.data.score;
            }
        }).catch(error => console.log('error message from @getCreditScore', error));
    }

    handleProperty(id) {
        getProperty({propertyId: id})
            .then(result => {
                
                this.rent = result.rent__c;
            })
            .catch(error => {
                console.log('error message: ', error);
            })

    }

    //When the submit button is clicked the insertTenant is triggered. Creating an Opportunity record.

    submitApplication() {
        insertTenant({
            name: `${this.firstName} ${this.lastName}`,
            property: this.propertyId,
            SSN: this.socialSecurity,
            phone: this.phoneNumber,
            email: this.email,
            DOB: this.dateOfBirth,
            DL: this.driverLicense,
            leaseTerm: this.leaseTerm,
            moveInDate: this.moveInDate,
            creditScore: this.data,
            monthlyIncome: this.monthlyIncome,
            veteran: this.veteran,
            rent: this.rent
        });

        this.resetFields();
        this.revealMessage();
    }

    resetFields() {
        this.template.querySelectorAll('lightning-input[data-id="reset"]').forEach(element => {
          element.value = null;
        });
      }


      revealMessage() {
        this.show = !this.show;
      }

}