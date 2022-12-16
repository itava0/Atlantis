import { LightningElement, wire, track } from "lwc";
import {
  publish,
  MessageContext,
  subscribe,
  unsubscribe
} from "lightning/messageService";
import { refreshApex } from "@salesforce/apex";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import FILTERSCHANGEMC from "@salesforce/messageChannel/FiltersChange__c";
import GOTUSERLOCATIONMC from "@salesforce/messageChannel/GotUserLocation__c";
import doAddressGeocodeInput from "@salesforce/apex/PropertyGeocode.DoAddressGeocodeInput";
import getAddresses from "@salesforce/apex/getAddresses.getAddressInfo";
import getProperties from "@salesforce/apex/getProperties.getAllProperties";

const DELAY = 350;
const MAX_PRICE = 50000;

export default class PropertyFilter extends LightningElement {
  // Variables handled by filters and list map
  searchKey = "";
  recordType = "Any";
  maxPrice = MAX_PRICE;
  minBedrooms = 0;
  minBathrooms = 0;
  minRating = 0;
  value = "Any";
  subscription;
  userLatitude = 0;
  userLongitude = 0;
  userLocated = false;
  useCurrentLocation = false;

  // Stores address location (cur = inputted value, evt = sent to API)
  curStreet;
  curCity;
  curState = "GA";
  curPostalCode;
  curDistance;
  evtStreet;
  evtCity;
  evtState = "GA";
  evtPostalCode;
  evtDistance;
  geocoded = false;

  // Wired values, in pairs to allow refreshApex() to function
  @track wiredAddresses = [];
  @track addresses = [];
  @track wiredProperties = [];
  @track properties = [];
  @track error;

  // For calculating distance
  distances = [];
  streets = [];
  cities = [];
  streetsAll = [];
  citiesAll = [];
  distance;
  belowAll;
  lat1;
  lon1;
  lat2;
  lon2;

  stateOptions = [
    { label: "Alabama", value: "AL" },
    { label: "Alaska", value: "AK" },
    { label: "Arizona", value: "AZ" },
    { label: "Arkansas", value: "AR" },
    { label: "California", value: "CA" },
    { label: "Colorado", value: "CO" },
    { label: "Connecticut", value: "CT" },
    { label: "Delaware", value: "DE" },
    { label: "District of Columbia", value: "DC" },
    { label: "Florida", value: "FL" },
    { label: "Georgia", value: "GA" },
    { label: "Hawaii", value: "HI" },
    { label: "Idaho", value: "ID" },
    { label: "Illinois", value: "IL" },
    { label: "Indiana", value: "IN" },
    { label: "Iowa", value: "IA" },
    { label: "Kansas", value: "KS" },
    { label: "Kentucky", value: "KY" },
    { label: "Louisiana", value: "LA" },
    { label: "Maine", value: "ME" },
    { label: "Maryland", value: "MD" },
    { label: "Massachusetts", value: "MA" },
    { label: "Michigan", value: "MI" },
    { label: "Minnesota", value: "MN" },
    { label: "Mississippi", value: "MS" },
    { label: "Missouri", value: "MO" },
    { label: "Montana", value: "MT" },
    { label: "Nebraska", value: "NE" },
    { label: "Nevada", value: "NV" },
    { label: "New Hampshire", value: "NH" },
    { label: "New Jersey", value: "NJ" },
    { label: "New Mexico", value: "NM" },
    { label: "New York", value: "NY" },
    { label: "North Carolina", value: "NC" },
    { label: "North Dakota", value: "ND" },
    { label: "Ohio", value: "OH" },
    { label: "Oklahoma", value: "OK" },
    { label: "Oregon", value: "OR" },
    { label: "Pennsylvania", value: "PA" },
    { label: "Rhode Island", value: "RI" },
    { label: "South Carolina", value: "SC" },
    { label: "South Dakota", value: "SD" },
    { label: "Tennessee", value: "TN" },
    { label: "Texas", value: "TX" },
    { label: "Utah", value: "UT" },
    { label: "Vermont", value: "VT" },
    { label: "Virginia", value: "VA" },
    { label: "Washington", value: "WA" },
    { label: "West Virginia", value: "WV" },
    { label: "Wisconsin", value: "WI" },
    { label: "Wyoming", value: "WY" }
  ];

  @wire(MessageContext)
  messageContext;

  // Options for Record Type picklist
  get options() {
    return [
      { label: "Any", value: "Any" },
      { label: "Apartment", value: "Apartment" },
      { label: "Single Family", value: "Single Family" },
      { label: "Townhouse", value: "Townhouse" }
    ];
  }

  handleReset() {
    // Reset filters
    this.template.querySelectorAll("lightning-input").forEach((element) => {
      element.value = null;
    });
    this.searchKey = "";
    this.recordType = "Any";
    this.maxPrice = MAX_PRICE;
    this.minBedrooms = 0;
    this.minBathrooms = 0;
    this.minRating = 0;
    this.streets = [];
    this.cities = [];
    this.fireChangeEvent();
  }

  handleUseCurrentLocationChange(event) {
    this.useCurrentLocation = event.target.checked;
  }

  handleSearchKeyChange(event) {
    this.searchKey = event.detail.value;
    this.fireChangeEvent();
  }

  handleRecordTypeChange(event) {
    this.value = event.detail.value;
    this.recordType = event.detail.value;
    this.fireChangeEvent();
  }

  handleMaxPriceChange(event) {
    this.maxPrice = event.detail.value;
    this.fireChangeEvent();
  }

  handleMinBedroomsChange(event) {
    this.minBedrooms = event.detail.value;
    this.fireChangeEvent();
  }

  handleMinBathroomsChange(event) {
    this.minBathrooms = event.detail.value;
    this.fireChangeEvent();
  }

  handleMinRatingChange(event) {
    this.minRating = event.detail.value;
    this.fireChangeEvent();
  }

  handleMessage(message) {
    // Get user location
    const toastEvt = new ShowToastEvent({
      title: "Geocoded your location",
      message: "Use the checkbox to get property distance from your current location",
      variant: "success"
    });
    this.dispatchEvent(toastEvt);
    this.userLocated = true;
    this.userLatitude = message.latitude;
    this.userLongitude = message.longitude;
    unsubscribe(this.subscription);
  }

  connectedCallback() {
    // Subscribe to message channel
    this.subscription = subscribe(
      this.messageContext,
      GOTUSERLOCATIONMC,
      (message) => {
        this.handleMessage(message);
      }
    );
  }

  fireChangeEvent() {
    // Debouncing this method: Do not actually fire the event as long as this function is
    // being called within a delay of DELAY. This is to avoid a very large number of Apex
    // method calls in components listening to this event.
    window.clearTimeout(this.delayTimeout);

    // Sends variables, primarily for filters, through message channel
    // eslint-disable-next-line @lwc/lwc/no-async-operation
    this.delayTimeout = setTimeout(() => {
      const filters = {
        searchKey: this.searchKey,
        recordType: this.recordType,
        maxPrice: this.maxPrice,
        minBedrooms: this.minBedrooms,
        minBathrooms: this.minBathrooms,
        minRating: this.minRating,
        streets: this.streets,
        cities: this.cities,
        distance: this.curDistance,
        latitude: this.lat1,
        longitude: this.lon1
      };
      publish(this.messageContext, FILTERSCHANGEMC, filters);
    }, DELAY);
  }

  geoAddress() {
    // Get geo of inputted address
    this.evtStreet = this.curStreet;
    this.evtCity = this.curCity;
    this.evtState = this.curState;
    this.evtPostalCode = this.curPostalCode;

    // Apex method which geocodes property from inputted address information
    doAddressGeocodeInput({
      iStreet: this.evtStreet,
      iCity: this.evtCity,
      iState: this.evtState,
      iPostalCode: this.evtPostalCode
    })
      .then(() => {
        if (
          this.evtStreet &&
          this.evtCity &&
          this.evtState &&
          this.evtPostalCode
        ) {
          const toastEvt = new ShowToastEvent({
            title: "Address geocoded",
            variant: "success"
          });
          this.dispatchEvent(toastEvt);
        }

        refreshApex(this.wiredAddresses);

        this.geocoded = true;
      })
      .catch((error) => {
        console.log(error.message);
      });
  }

  getDistance() {
    refreshApex(this.wiredAddresses);

    // Geocodes address if values have changed (allows users to resubmit without refreshing)
    if (
      (this.curStreet !== this.evtStreet ||
      this.curCity !== this.evtCity ||
      this.curState !== this.evtState ||
      this.curPostalCode !== this.evtPostalCode) &&
      this.useCurrentLocation === false
    ) {
      this.geocoded = false;
    }

    // Only called when geocoding is required (prevents need for two separate buttons)
    if (!this.geocoded) {
      this.geoAddress();
    }

    this.evtDistance = this.curDistance;
    this.streets = [];
    this.cities = [];
    this.distances = [];
    this.belowAll = true;

    // Check Addresses and If Match, Calculate Distance
    for (let i = 0; i < 5; i++) {
      if (
        this.addresses[i].Latitude__c != null &&
        this.addresses[i].Longitude__c != null &&
        !this.useCurrentLocation
      ) {
        if (
          this.addresses[i].Street__c === this.evtStreet &&
          this.addresses[i].City__c === this.evtCity &&
          this.addresses[i].State__c === this.evtState &&
          this.addresses[i].PostalCode__c === this.evtPostalCode
        ) {
          // First set of geocoordinates grabbed from inputted address (saved in Address object)
          this.lat1 = this.addresses[i].Latitude__c;
          this.lon1 = this.addresses[i].Longitude__c;
          for (let j = 0; j < this.properties.length; j++) {
            // For each property, second set of geocoordinates grabbed from property's fields
            this.lat2 = this.properties[j].Geolocation__Latitude__s;
            this.lon2 = this.properties[j].Geolocation__Longitude__s;
            // Calculates the distance given these coordinates
            this.distance = this.calculateDistance(
              this.lat1,
              this.lon1,
              this.lat2,
              this.lon2
            );
            console.log(
              "DISTANCE",
              this.properties[j].Billing_Street__c,
              this.properties[j].Billing_City__c,
              this.distance
            );
            // Pushes street & city info with distance at matching indexes, so the property can be connected to the acquired distance
            this.streetsAll.push(this.properties[j].Billing_Street__c);
            this.citiesAll.push(this.properties[j].Billing_City__c);
            this.distances.push(this.distance);
          }
        }
      } else if(this.useCurrentLocation) {
        // Same as above, but using current location data instead of inputted information
        console.log("USE CURRENT LOCATION");
        this.lat1 = this.userLatitude;
        this.lon1 = this.userLongitude;
        console.log("USER LOCATION", this.lat1, this.lon1)
        for (let j = 0; j < this.properties.length; j++) {
          this.lat2 = this.properties[j].Geolocation__Latitude__s;
          this.lon2 = this.properties[j].Geolocation__Longitude__s;
          this.distance = this.calculateDistance(
            this.lat1,
            this.lon1,
            this.lat2,
            this.lon2
          );
          console.log(
            "DISTANCE",
            this.properties[j].Billing_Street__c,
            this.properties[j].Billing_City__c,
            this.distance
          );
          this.streetsAll.push(this.properties[j].Billing_Street__c);
          this.citiesAll.push(this.properties[j].Billing_City__c);
          this.distances.push(this.distance);
        }
      }
      else {
        console.log("No matching geocoded address found.");
      }
    }

    // Filter Out Properties That Exceed Max Distance
    if (this.distances.length > 0) {
      for (let k = 0; k < this.properties.length; k++) {
        if (this.distances[k] <= this.evtDistance) {
          this.belowAll = false;
          console.log(
            "IN RANGE",
            this.streetsAll[k],
            this.citiesAll[k],
            this.distances[k]
          );
          // New arrays that will be pushed to the filters, used in SOQL queries to only return the matching addresses for filter results
          this.streets.push(this.properties[k].Billing_Street__c);
          this.cities.push(this.properties[k].Billing_City__c);
        } else {
          // console.log("OUT OF RANGE", this.streets[k], this.cities[k], this.distances[k]);
        }
      }
      // Handles an edge case where filters don't update properly if the inputted address is below every retrieved distance
      if (this.belowAll) {
        this.streets.push("Not a Real Address");
        this.cities.push("Not a Real City");
      }
    } else {
      // Message user that address data is still being processed by API
      console.log("PLEASE GEO ADDRESS");
      const toastEvt = new ShowToastEvent({
        title: "No address data found",
        message: "You may need to wait a few seconds.",
        variant: "warning"
      });
      this.dispatchEvent(toastEvt);
    }

    this.fireChangeEvent();
  }

  // Fetch Address Records
  @wire(getAddresses) getAddresses(result) {
    this.wiredAddresses = result;

    if (result.data) {
      this.addresses = result.data;
      this.error = undefined;
    } else if (result.error) {
      this.error = result.error;
      this.addresses = [];
    }
  }

  // Fetch Property Records
  @wire(getProperties) getProperties(result) {
    this.wiredProperties = result;

    if (result.data) {
      this.properties = result.data;
      this.error = undefined;
    } else if (result.error) {
      this.error = result.error;
      this.properties = [];
    }
  }

  calculateDistance(lat1, lon1, lat2, lon2) {
    // Earth's radius in kilometers
    const R = 6371;
  
    // Convert latitude and longitude values from degrees to radians
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    lat1 = lat1 * (Math.PI / 180);
    lat2 = lat2 * (Math.PI / 180);
  
    // Apply the Haversine formula to calculate the distance between the two points
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c;
  
    // Return the distance in miles
    return d * 0.621371192;
  }

  handleStreetChange(event) {
    this.curStreet = event.target.value;
  }

  handleCityChange(event) {
    this.curCity = event.target.value;
  }

  handleStateChange(event) {
    this.curState = event.target.value;
  }

  handlePostalCodeChange(event) {
    this.curPostalCode = event.target.value;
  }

  handleDistanceChange(event) {
    this.curDistance = event.target.value;
  }
}