import { LightningElement, wire, track } from "lwc";
import { publish, MessageContext, subscribe, unsubscribe } from "lightning/messageService";
import FILTERSCHANGEMC from "@salesforce/messageChannel/FiltersChange__c";
import MAPGRIDSWAPMC from "@salesforce/messageChannel/MapGridSwap__c";
import getProperties from "@salesforce/apex/getProperties.getAllProperties";

const DELAY = 350;
const MAX_PRICE = 10000;

export default class PropertyFilter extends LightningElement {

  // Properties
  @track properties = [];
  @track error;
  subscription;
  
  // Variables from child components to update filters
  searchKey = "";
  recordType = "Any";
  maxPrice = MAX_PRICE;
  minBedrooms = 0;
  minBathrooms = 0;
  minRating = 0;
  pageNumber = 1;
  cxpwEnabled = false;
  moorelandEnabled = false;
  companies = ['Atlantis'];
  propsInDistance = [];
  distance = 0;
  useLocation = false;
  filteringDistance = false;
  userLatitude;
  userLongitude;
  addressLatitude;
  addressLongitude;

  @wire(MessageContext)
  messageContext;
  
  // Fetch Property Records
  @wire(getProperties) getProperties(result) {
    if (result.data) {
      this.properties = result.data;
      this.error = undefined;
    } else if (result.error) {
      this.error = result.error;
      this.properties = [];
    }
  }

  // Subscribe to message channel
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

  // Unsubscribe from message channel
  disconnectedCallback() {
    unsubscribe(this.subscription);
    this.subscription = null;
  }

  // Reset filter inputs & their values in all child components
  handleReset() {
    this.template.querySelector('c-property-filter-fields').resetInputs();
    this.template.querySelector('c-property-filter-distance').resetInputs();
    this.template.querySelector('c-property-filter-partners').resetInputs();
    this.searchKey = "";
    this.recordType = "Any";
    this.maxPrice = MAX_PRICE;
    this.minBedrooms = 0;
    this.minBathrooms = 0;
    this.minRating = 0;
    this.propsInDistance = [];
    this.distance = 0;
    this.useLocation = false;
    this.filteringDistance = false;
    this.cxpwEnabled = false;
    this.moorelandEnabled = false;
    this.companies = ['Atlantis'];
    this.pageNumber = 1;
    this.fireChangeEvent();
  }

  // Custom Event from Child Component: Fields
  handleFieldsUpdate(event) {
    this.searchKey = event.detail.searchKey;
    this.recordType = event.detail.recordType;
    this.maxPrice = event.detail.maxPrice;
    this.minBedrooms = event.detail.minBedrooms;
    this.minBathrooms = event.detail.minBathrooms;
    this.minRating = event.detail.minRating;
    this.pageNumber = event.detail.pageNumber;
    this.fireChangeEvent();
  }

  // Custom Event from Child Component: Distance
  handleDistanceUpdate(event) {
    this.propsInDistance = event.detail.propsInDistance;
    this.distance = event.detail.distance;
    this.userLatitude = event.detail.userLatitude;
    this.userLongitude = event.detail.userLongitude;
    this.addressLatitude = event.detail.addressLatitude;
    this.addressLongitude = event.detail.addressLongitude;
    this.useLocation = event.detail.useLocation;
    this.filteringDistance = event.detail.filteringDistance;
    this.pageNumber = event.detail.pageNumber;
    this.fireChangeEvent();
  }

  // Custom Event from Child Component: Partners
  handlePartnersUpdate(event) {
    this.cxpwEnabled = event.detail.cxpwEnabled;
    this.moorelandEnabled = event.detail.moorelandEnabled;
    this.companies = event.detail.companies;
    this.pageNumber = event.detail.pageNumber;
    this.fireChangeEvent();
  }

  // After receiving an update from one of the child custom events, calls message channel to update map & grid
  fireChangeEvent() {
    window.clearTimeout(this.delayTimeout);

    // Sends variables, primarily for filters, through message channel
    this.delayTimeout = setTimeout(() => {
      const filters = {
        searchKey: this.searchKey,
        recordType: this.recordType,
        maxPrice: this.maxPrice,
        minBedrooms: this.minBedrooms,
        minBathrooms: this.minBathrooms,
        minRating: this.minRating,
        propsInDistance: this.propsInDistance,
        distance: this.distance,
        useLocation: this.useLocation,
        filteringDistance: this.filteringDistance,
        pageNumber: this.pageNumber,
        cxpwEnabled: this.cxpwEnabled,
        moorelandEnabled: this.moorelandEnabled,
        companies: this.companies,
        userLatitude: this.userLatitude,
        userLongitude: this.userLongitude,
        addressLatitude: this.addressLatitude,
        addressLongitude: this.addressLongitude
      };
      publish(this.messageContext, FILTERSCHANGEMC, filters);
    }, DELAY);
  }
}