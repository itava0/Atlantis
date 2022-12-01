import { LightningElement, wire } from 'lwc';
import { refreshApex } from '@salesforce/apex'
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

export default class PropertyListMap extends LightningElement {

    mapMarkers;
    zoomLevel;
    listView;
    center;
    newMapMarker;
    selectedMarkerValue;

    pageNumber = 1;
    pageSize = PAGE_SIZE;
    mapMarkers = [];

    searchKey = '';
    recordType = 'Any';
    maxPrice = 50000;
    minBedrooms = 0;
    minBathrooms = 0;
    minRating = 0;

    @wire(MessageContext)
    messageContext;

    @wire(getPagedPropertyList, {
        searchKey: '$searchKey',
        recordType: '$recordType',
        maxPrice: '$maxPrice',
        minBedrooms: '$minBedrooms',
        minBathrooms: '$minBathrooms',
        minRating: '$minRating',
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

        this.center = {
            location: {
                Latitude: '33.753746',
                Longitude: '-84.386330'
            }
        }

        this.mapMarkers = [];
        this.zoomLevel = 11;
        this.listView = "hidden";
    }



    updateMarkers() {
        this.mapMarkers = [];
        // console.log("EMPTY MARKERS: ", JSON.stringify(this.mapMarkers));
        // console.log("RECORDS TO ADD: ", JSON.stringify(this.properties.data.records.length));
        
        refreshApex(this.properties);

        console.log('TEST: ', this.properties.data);
        if (this.properties) {
            if (this.properties.data) {
                if (this.properties.data.records) {
                    for (let i = 0; i < this.properties.data.records.length; i++) {
                        this.newMapMarker = {
                            location: {
                                // Street: this.properties.data.records[i].Billing_Street__c,
                                // City: this.properties.data.records[i].Billing_City__c,
                                // State: this.properties.data.records[i].Billing_State__c,
                                // PostalCode: this.properties.data.records[i].Billing_Postal_Code__c,
                                // Country: this.properties.data.records[i].Billing_Country__c
                                Latitude: this.properties.data.records[i].Geolocation__Latitude__s,
                                Longitude: this.properties.data.records[i].Geolocation__Longitude__s 
                            },
                            value: this.properties.data.records[i].Id,
                            title: this.properties.data.records[i].Billing_Street__c,
                            description: this.properties.data.records[i].Billing_City__c + ', ' + this.properties.data.records[i].Billing_State__c + ' ' + this.properties.data.records[i].Billing_Postal_Code__c
                        };
                        this.mapMarkers.push(this.newMapMarker);
                    };
                }
            }            
        }
        
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
        // this.updateMarkers();
    }

    handleMarkerSelect(event) {
        this.selectedMarkerValue = event.target.selectedMarkerValue;
        this.handlePropertySelected();
    }

    handlePropertySelected(event) {
        const message = { propertyId: this.selectedMarkerValue };
        publish(this.messageContext, PROPERTYSELECTEDMC, message);
    }
}