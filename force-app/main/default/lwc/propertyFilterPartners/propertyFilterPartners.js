import { LightningElement, track, api } from "lwc";

export default class PropertyFilterPartners extends LightningElement {
    // Variables handled by filters and list map
    @api properties;
    @track cxpwEnabled = false;
    @track moorelandEnabled = false;
    @track eventDetail;
    companies = ['Atlantis'];
    pageNumber = 1;

    // Reset inputs and their values from parent's Reset button
    @api resetInputs() {
        this.template.querySelectorAll("lightning-input").forEach((element) => {
            element.value = null;
        });

        this.cxpwEnabled = false;
        this.moorelandEnabled = false;
        this.companies = ['Atlantis'];
        this.pageNumber = 1;
        this.pageNumber = 1;
    }

    // Enable partner properties from CXPW
    handleCXPWProperties() {
        this.cxpwEnabled = !this.cxpwEnabled;
        this.fireChangeEvent();
    }

    // Enable partner properties from Mooreland
    handleMoorelandProperties() {
        this.moorelandEnabled = !this.moorelandEnabled;
        this.fireChangeEvent();
    }

    // Update which partner properties to display using an array of strings to match Origin Company field
    updatePartners() {
        if (!this.cxpwEnabled && !this.moorelandEnabled) this.companies = ['Atlantis'];
        else if (this.cxpwEnabled && !this.moorelandEnabled) this.companies = ['Atlantis', 'CXPW'];
        else if (!this.cxpwEnabled && this.moorelandEnabled) this.companies = ['Atlantis', 'Mooreland'];
        else if (this.cxpwEnabled && this.moorelandEnabled) this.companies = ['Atlantis', 'CXPW', 'Mooreland'];
    }

    // Sends custom event back to parent component with updated information
    fireChangeEvent() {
        this.updatePartners();

        this.eventDetail = {
            cxpwEnabled: this.cxpwEnabled,
            moorelandEnabled: this.moorelandEnabled,
            companies: this.companies,
            pageNumber: this.pageNumber
        }

        const updatedPartners = new CustomEvent("partnersupdate", {
            detail: this.eventDetail
        });

        this.dispatchEvent(updatedPartners);
    }
}