import { LightningElement, api, wire, track } from 'lwc';
import { getRecord } from 'lightning/uiRecordApi';
import CXPW_LOGO from '@salesforce/resourceUrl/CXPWLogo';
import ATLANTIS_LOGO from '@salesforce/resourceUrl/AtlantisLogo';
import MOORELAND_LOGO from '@salesforce/resourceUrl/MoorelandLogo';

const fields = ['Property__c.Origin_Company__c', 'Property__c.Id'];
const titles = { CXPW: 'CXPW Properties', Atlantis: 'Atlantis Property Company', Mooreland: 'Mooreland Properties' };

export default class PropertyPartnerInfo extends LightningElement {
    @api recordId;
    @track record;
    @track error;

    partnerName = null;
    logo = null;

    @wire (getRecord, { recordId: '$recordId', fields: fields })
    getProperty({ error, data }) {
        if (data) {
            this.record = data;
            this.error = undefined;
            console.log("Record", data);
            switch (data.fields.Origin_Company__c.value) {
                case 'CXPW':
                    this.logo = CXPW_LOGO;
                    break;
                case 'Atlantis':
                    this.logo = ATLANTIS_LOGO;
                    break;
                case 'Mooreland':
                    this.Logo = MOORELAND_LOGO;
                    break;
                default:
                    this.logo = null;
            }
            this.partnerName = titles[data.fields.Origin_Company__c.value];
            console.log("Logo", this.logo)
        } else if (error) {
            this.error = error;
            this.record = undefined;
            console.log("Error", this.error)
        }
    }

    connectedCallback() {
        console.log("Partner Info Loaded");
    }
}