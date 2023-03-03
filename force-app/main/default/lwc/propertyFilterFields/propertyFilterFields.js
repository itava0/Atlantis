import { LightningElement, wire, track, api } from "lwc";
import { MessageContext, subscribe, unsubscribe } from "lightning/messageService";
import MAPGRIDSWAPMC from "@salesforce/messageChannel/MapGridSwap__c";

const MAX_PRICE = 100000;

export default class PropertyFilterFields extends LightningElement {
    // Variables handled by filters
    searchKey = "";
    recordType = "Any";
    maxPrice = MAX_PRICE;
    minBedrooms = 0;
    minBathrooms = 0;
    minRating = 0;
    value = "Any";
    companies = ["Atlantis"];
    subscription;
    pageNumber = 1;
    userLatitude = 0;
    userLongitude = 0;
    userLocated = false;
    useCurrentLocation = false;
    @track cxpwEnabled = false;
    @track moorelandEnabled = false;
    @api properties;
    @track eventDetail;

    @wire(MessageContext)
    messageContext;

    // Options for Record Type picklist
    get options() {
        return [
            { label: "Any", value: "Any" },
            { label: "Apartment", value: "Apartment" },
            { label: "Single Family", value: "Single Family" },
            { label: "Townhouse", value: "Townhouse" },
            { label: "Condo", value: "Condo" }
        ];
    }

    // Filter Update: Search Key
    handleSearchKeyChange(event) {
        this.searchKey = event.detail.value;
        this.fireChangeEvent();
    }

    // Filter Update: Record Type
    handleRecordTypeChange(event) {
        this.value = event.detail.value;
        this.recordType = event.detail.value;
        this.fireChangeEvent();
    }

    // Filter Update: Max Price
    handleMaxPriceChange(event) {
        this.maxPrice = event.detail.value;
        this.fireChangeEvent();
    }

    // Filter Update: Min Bedrooms
    handleMinBedroomsChange(event) {
        this.minBedrooms = event.detail.value;
        this.fireChangeEvent();
    }

    // Filter Update: Min Bathrooms
    handleMinBathroomsChange(event) {
        this.minBathrooms = event.detail.value;
        this.fireChangeEvent();
    }

    // Filter Update: Min Rating
    handleMinRatingChange(event) {
        this.minRating = event.detail.value;
        this.fireChangeEvent();
    }

    // Subscribe to message channel
    connectedCallback() {
        // Message channel to update filters again if user switches between map and grid
        this.subscription = subscribe(
        this.messageContext,
        MAPGRIDSWAPMC,
        () => {
            this.fireChangeEvent();
        }
        );
    }

    // Unsubscribe from message channel
    disconnectedCallback() {
        unsubscribe(this.subscription);
        this.subscription = null;
    }

    // Sends custom event back to parent component with updated information
    fireChangeEvent() {
        this.eventDetail = {
            searchKey: this.searchKey,
            recordType: this.recordType,
            maxPrice: this.maxPrice,
            minBedrooms: this.minBedrooms,
            minBathrooms: this.minBathrooms,
            minRating: this.minRating,
            pageNumber: this.pageNumber
        }

        const updatedFields = new CustomEvent("fieldsupdate", {
            detail: this.eventDetail
        });

        this.dispatchEvent(updatedFields);
    }
}