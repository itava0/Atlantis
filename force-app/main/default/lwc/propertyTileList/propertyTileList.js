import { LightningElement, wire, track } from 'lwc';
import { publish, subscribe, unsubscribe, MessageContext } from 'lightning/messageService';
import FILTERSCHANGEMC from '@salesforce/messageChannel/FiltersChange__c';
import GOTUSERLOCATIONMC from '@salesforce/messageChannel/GotUserLocation__c';
import getPagedPropertyList from '@salesforce/apex/PropertyController.getPagedPropertyList';

const PAGE_SIZE = 12;

export default class PropertyTileList extends LightningElement {
    apiUrl = 'https://ipwho.is/';
    locGot = false;
    pageNumber = 1;
    pageSize = PAGE_SIZE;
    cxpwEnabled = false;
    moorelandEnabled = false;
    searchKey = '';
    recordType = 'Any';
    maxPrice = 10000;
    minBedrooms = 0;
    minBathrooms = 0;
    minRating = 0;
    propsInDistance = [];
    distance = 0;
    useLocation = false;
    filteringDistance = false;
    companies = ['Atlantis'];
    userLatitude;
    userLongitude;
    addressLatitude;
    addressLongitude;

    @track properties;
    @track curProperties;
    @track error;
    noProperties = false;

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
        propsInDistance: '$propsInDistance',
        pageSize: '$pageSize',
        pageNumber: '$pageNumber',
        companies: '$companies',
        filteringDistance: '$filteringDistance'
    })
    getPagedPropertyList(result) {
        this.properties = result;
        if (result.data) {
            this.curProperties = result.data;
            this.noProperties = this.curProperties.records.length == 0 ? true : false;
            if (!this.locGot) this.getLocation();
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
        this.propsInDistance = filters.propsInDistance;
        this.distance = filters.distance;
        this.useLocation = filters.useLocation;
        this.filteringDistance = filters.filteringDistance;
        this.pageNumber = filters.pageNumber;
        this.cxpwEnabled = filters.cxpwEnabled;
        this.moorelandEnabled = filters.moorelandEnabled;
        this.companies = filters.companies;
        this.userLatitude = filters.userLatitude;
        this.userLongitude = filters.userLongitude;
        this.addressLatitude = filters.addressLatitude;
        this.addressLongitude = filters.addressLongitude;
        this.locGot = filters.locGot;
    }

    // Move to previous page of tiles
    handlePreviousPage() {
        this.pageNumber = this.pageNumber - 1;
    }

    // Move to next page of tiles
    handleNextPage() {
        this.pageNumber = this.pageNumber + 1;
    }

    // Attempts to retrieve user's current geolocation
    // Copied from List Map and modified accordingly so that geolocation occurs on Property Grid as well as Property Map
    // Previously, this method only fired after user opens Property Map. This way, user's geolocation can happen on page load regardless of if Map or Grid is default
    getLocation() {
        navigator.permissions.query({ name: "geolocation" }).then((geoStatus) => {
            if (geoStatus.state === "granted" || geoStatus.state === "prompt") {
                navigator.geolocation.getCurrentPosition((position) => {
                    this.userLatitude = position.coords.latitude;
                    this.userLongitude = position.coords.longitude;
                    this.locGot = true;
                    publish(this.messageContext, GOTUSERLOCATIONMC, {
                        latitude: this.userLatitude,
                        longitude: this.userLongitude,
                        locGot: this.locGot
                    });
                });
            } else {
                fetch(this.apiUrl)
                .then((response) => response.json())
                .then((data) => {
                    this.userLatitude = data.latitude;
                    this.userLongitude = data.longitude;
                    this.locGot = true;
                    publish(this.messageContext, GOTUSERLOCATIONMC, {
                        latitude: this.userLatitude,
                        longitude: this.userLongitude,
                        locGot: this.locGot
                    });
                })
                .catch(() => {
                    return false;
                });
            }
        });
    }
}