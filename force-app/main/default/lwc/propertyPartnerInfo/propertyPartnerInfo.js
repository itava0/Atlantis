import { LightningElement, api, wire, track } from 'lwc';
import { getRecord } from 'lightning/uiRecordApi';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import getUserInfo from '@salesforce/apex/Users.getUserInfo';
import CXPW_LOGO from '@salesforce/resourceUrl/CXPWLogo';
import ATLANTIS_LOGO from '@salesforce/resourceUrl/AtlantisLogo';
import MOORELAND_LOGO from '@salesforce/resourceUrl/MoorelandLogo';
import PropertyPartnerModal from './propertyPartnerModal';

const fields = ['Property__c.Origin_Company__c', 'Property__c.Id', 'Property__c.External_Id__c'];
const titles = { CXPW: 'CXPW Properties', Atlantis: 'Atlantis Property Company', Mooreland: 'Mooreland Properties' };

export default class PropertyPartnerInfo extends LightningElement {
    @api recordId;
    @track record;
    @track error;

    partnerName = null;
    logo = null;

    fName = null;
    lName = null;
    email = null;
    phone = null;

    body = {
        firstName: null,
        lastName: null,
        email: null,
        phone: null,
        propertyId: null,
        originCompany: null
    }

    @wire (getRecord, { recordId: '$recordId', fields: fields })
    getProperty({ error, data }) {
        if (data) {
            this.record = data;
            this.error = undefined;
            console.log("Record", data);
            this.body.originCompany = data.fields.Origin_Company__c.value;
            switch (data.fields.Origin_Company__c.value) {
                case 'CXPW':
                    this.logo = CXPW_LOGO;
                    break;
                case 'Atlantis':
                    this.logo = ATLANTIS_LOGO;
                    break;
                case 'Mooreland':
                    this.logo = MOORELAND_LOGO;
                    break;
                default:
                    this.logo = null;
            }
            console.log(this.logo)
            this.partnerName = titles[data.fields.Origin_Company__c.value];
        } else if (error) {
            this.error = error;
            this.record = undefined;
            console.log("Error", this.error)
        }
    }

    connectedCallback() {
        getUserInfo().then(result => {
            if(result != null)
            {
                this.fName = result.FirstName;
                this.lName = result.LastName;
                this.email = result.Email;
                this.phone = result.Phone;
            }
            console.log(result);
        }).catch(error => {
            console.log("Error", error);
        });
        console.log("Partner Info Loaded");
    }

    async handleScheduleClick() {
        this.body.firstName = this.fName;
        this.body.lastName = this.lName;
        this.body.email = this.email;
        this.body.phone = this.phone;
        this.body.propertyId = this.recordId;

        console.log('MODALBODY',this.body)

        const result = await PropertyPartnerModal.open({
            size: 'small',
            description: 'Accessible description of modal\'s purpose',
            content: this.body,
        });
        console.log(result);
        if (result) {
            this.showToast();
        }
    }

    showToast() {
        const event = new ShowToastEvent({
            title: 'Success',
            message: 'Your contact information has been sent to the property partner.',
            variant: 'success'
        });
        this.dispatchEvent(event);
    }
}