import { LightningElement, wire, track } from 'lwc';
import {
    publish,
    subscribe,
    unsubscribe,
    MessageContext
} from 'lightning/messageService';
import FILTERSCHANGEMC from '@salesforce/messageChannel/FiltersChange__c';
import PROPERTYSELECTEDMC from '@salesforce/messageChannel/PropertySelected__c';
import getPagedPropertyList from '@salesforce/apex/PropertyController.getPagedPropertyList';

const PAGE_SIZE = 12;

export default class PropertyTileList extends LightningElement {
    pageNumber = 1;
    pageSize = PAGE_SIZE;

    searchKey = '';
    recordType = 'Any';
    maxPrice = 50000;
    minBedrooms = 0;
    minBathrooms = 0;
    minRating = 0;
    streets = [];
    cities = [];

    @track properties;
    @track curProperties;
    @track error;

    @wire(MessageContext)
    messageContext;

    // Get paginated list of properties from filter component
    @wire(getPagedPropertyList, {
        searchKey: '$searchKey',
        recordType: '$recordType',
        maxPrice: '$maxPrice',
        minBedrooms: '$minBedrooms',
        minBathrooms: '$minBathrooms',
        minRating: '$minRating',
        streets: '$streets',
        cities: '$cities',
        pageSize: '$pageSize',
        pageNumber: '$pageNumber'
    })
    getPagedPropertyList(result) {
        this.properties = result;
        if (result.data) {
            this.curProperties = result.data;
            this.error = undefined;
        } else if (result.error) {
            this.error = result.error;
            this.curProperties = [];
        }
    };

    // Subscribe to message channel
    connectedCallback() {
        this.subscription = subscribe(
            this.messageContext,
            FILTERSCHANGEMC,
            (message) => {
                this.handleFilterChange(message);
            }
        );
    }

    // Unsubscribe from message channel
    disconnectedCallback() {
        unsubscribe(this.subscription);
        this.subscription = null;
    }

    // Update variables based on filter component
    handleFilterChange(filters) {
        this.searchKey = filters.searchKey;
        this.recordType = filters.recordType;
        this.maxPrice = filters.maxPrice;
        this.minBedrooms = filters.minBedrooms;
        this.minBathrooms = filters.minBathrooms;
        this.minRating = filters.minRating;
        this.streets = filters.streets;
        this.cities = filters.cities;
        this.pageNumber = filters.pageNumber;
    }

    // Move to previous page of tiles
    handlePreviousPage() {
        this.pageNumber = this.pageNumber - 1;
    }

    // Move to next page of tiles
    handleNextPage() {
        this.pageNumber = this.pageNumber + 1;
    }

    // Update current property based on message channel
    handlePropertySelected(event) {
        const message = { propertyId: event.detail };
        publish(this.messageContext, PROPERTYSELECTEDMC, message);
    }
}