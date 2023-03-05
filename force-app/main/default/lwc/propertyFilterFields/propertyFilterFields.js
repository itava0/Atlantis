import { LightningElement, track, api } from "lwc";

const MAX_PRICE = 10000;

export default class PropertyFilterFields extends LightningElement {
    // Variables handled by filters
    searchKey = "";
    recordType = "Any";
    maxPrice = MAX_PRICE;
    minBedrooms = 0;
    minBathrooms = 0;
    minRating = 0;
    value = "Any";
    pageNumber = 1;
    @api properties;
    @track eventDetail;

    // Reset inputs and their values from parent's Reset button
    @api resetInputs() {
        this.template.querySelectorAll("lightning-input").forEach((element) => {
            element.value = null;
        });

        this.searchKey = "";
        this.recordType = "Any";
        this.maxPrice = MAX_PRICE;
        this.minBedrooms = 0;
        this.minBathrooms = 0;
        this.minRating = 0;
        this.pageNumber = 1;
    }

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