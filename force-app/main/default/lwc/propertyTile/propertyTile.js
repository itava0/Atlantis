import { LightningElement, api, wire } from "lwc";
import { NavigationMixin } from "lightning/navigation";
import ATLANTIS_LOGO from '@salesforce/resourceUrl/AtlantisLogo';
import CXPW_LOGO from '@salesforce/resourceUrl/CXPWLogo';
import MOORELAND_LOGO from '@salesforce/resourceUrl/MoorelandLogo';

export default class PropertyTile extends NavigationMixin(LightningElement) {
  @api property;
  @api cxpwEnabled;
  @api moorelandEnabled;
  partnersEnabled = false;
  currentId;
  selected = false;
  companyLogo;

  // On page load
  connectedCallback() {
    this.selected = false;
    
    // Determine partner status and logo
    this.updateLogo();
  }

  // Update logo display status based on partner information 
  renderedCallback() {
    this.updatePartners();
  }

  // Determine if partners should be played (requiring at least one of CXPW or Mooreland be enabled)
  updatePartners() {
    if (this.cxpwEnabled || this.moorelandEnabled) {
      this.partnersEnabled = true;
    } else {
      this.partnersEnabled = false;
    }
  }

  // Determine logo based on origin company
  updateLogo() {
    switch (this.property.Origin_Company__c) {
      case 'Atlantis':
        this.companyLogo = ATLANTIS_LOGO;
        break;
      case 'CXPW':
        this.companyLogo = CXPW_LOGO;
        break;
      case 'Mooreland':
        this.companyLogo = MOORELAND_LOGO;
        break;
      default:
        this.companyLogo = null;
    }
  }

  // When mouse hovers over property tile
  handlePropertySelected() {
    this.selected = true;
  }

  // When mouse leaves property tile
  handlePropertyDeselected() {
    this.selected = false;
  }

  // Navigate to record page
  handleNavigateToRecord() {
    this[NavigationMixin.Navigate]({
      type: "standard__recordPage",
      attributes: {
        recordId: this.property.Id,
        objectApiName: "Property__c",
        actionName: "view"
      }
    });
  }

  // Navigate to lease application page
  navigateToApplicationPage() {
    // set sessionStorage values
    sessionStorage.setItem("id", this.property.Id);

    switch (this.property.Origin_Company__c) {
      case 'Atlantis':
        this[NavigationMixin.Navigate]({
          type: "standard__namedPage",
          attributes: {
            pageName: "application"
          }
        });
        break;
      case 'CXPW':
        this[NavigationMixin.Navigate]({
          type: "standard__webPage",
          attributes: {
            url: 'https://smoothstack9-dev-ed.develop.my.site.com/cxpw/s/'
          }
        });
        break;
      case 'Mooreland':
        this[NavigationMixin.Navigate]({
          type: "standard__webPage",
          attributes: {
            url: 'https://smoothstack35-dev-ed.develop.my.site.com/accountportal/s/'
          }
        });
        break;
      default:
        // default
    }
  }

  get backgroundImageStyle() {
    return `background-image:url(${this.property.Picture__c})`;
  }
}