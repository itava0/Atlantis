import { LightningElement, wire, track, api } from "lwc";
import { MessageContext, subscribe, unsubscribe } from "lightning/messageService";
import MAPGRIDSWAPMC from "@salesforce/messageChannel/MapGridSwap__c";

export default class PropertyFilterPartners extends LightningElement {
    // Variables handled by filters and list map
    @api properties;
    @track cxpwEnabled = false;
    @track moorelandEnabled = false;
    @track eventDetail;
    pageNumber = 1;
    subscription;
    companies = ["Atlantis"];
    
    @wire(MessageContext)
    messageContext;

    // Reset filters
    handleReset() {
        this.template.querySelectorAll("lightning-input").forEach((element) => {
            element.value = null;
        });
        this.pageNumber = 1;
        this.cxpwEnabled = false;
        this.moorelandEnabled = false;
        this.companies = ["Atlantis"];
        this.fireChangeEvent();
    }

    // Subscribe to message channels
    connectedCallback() {
        // Subscription: Message channel to update filters again if user switches between map and grid
        this.subscription = subscribe(
        this.messageContext,
        MAPGRIDSWAPMC,
        () => {
            this.fireChangeEvent();
        }
        );
    }

    // Unsubscribe from message channels
    disconnectedCallback() {
        unsubscribe(this.subscription);
        this.subscription = null;
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
}