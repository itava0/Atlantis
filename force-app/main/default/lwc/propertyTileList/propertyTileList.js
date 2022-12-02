import { LightningElement, wire } from 'lwc';
import {
    publish,
    subscribe,
    unsubscribe,
    MessageContext
} from 'lightning/messageService';
import FILTERSCHANGEMC from '@salesforce/messageChannel/FiltersChange__c';
import PROPERTYSELECTEDMC from '@salesforce/messageChannel/PropertySelected__c';
import getPagedPropertyList from '@salesforce/apex/PropertyController.getPagedPropertyList';

const PAGE_SIZE = 9;

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

    @wire(MessageContext)
    messageContext;

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
    properties;

    connectedCallback() {
        this.subscription = subscribe(
            this.messageContext,
            FILTERSCHANGEMC,
            (message) => {
                this.handleFilterChange(message);
            }
        );
    }

    disconnectedCallback() {
        unsubscribe(this.subscription);
        this.subscription = null;
    }

    handleFilterChange(filters) {
        this.searchKey = filters.searchKey;
        this.recordType = filters.recordType;
        this.maxPrice = filters.maxPrice;
        this.minBedrooms = filters.minBedrooms;
        this.minBathrooms = filters.minBathrooms;
        this.minRating = filters.minRating;
        this.streets = filters.streets;
        this.cities = filters.cities;
    }

    handlePreviousPage() {
        this.pageNumber = this.pageNumber - 1;
    }

    handleNextPage() {
        this.pageNumber = this.pageNumber + 1;
    }

    handlePropertySelected(event) {
        const message = { propertyId: event.detail };
        publish(this.messageContext, PROPERTYSELECTEDMC, message);
    }
}
