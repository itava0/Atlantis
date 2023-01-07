import { LightningElement, wire, track } from "lwc";
import { NavigationMixin } from "lightning/navigation";
import { refreshApex } from "@salesforce/apex";
import {
  publish,
  subscribe,
  unsubscribe,
  MessageContext
} from "lightning/messageService";
import FILTERSCHANGEMC from "@salesforce/messageChannel/FiltersChange__c";
import PROPERTYSELECTEDMC from "@salesforce/messageChannel/PropertySelected__c";
import GOTUSERLOCATIONMC from "@salesforce/messageChannel/GotUserLocation__c";
import getPagedPropertyList from "@salesforce/apex/PropertyController.getPagedPropertyList";
import getAllProperties from '@salesforce/apex/getProperties.getAllProperties';
//import ReverseGeocodeApex from "@salesforce/apex/ReverseGeocodingService.ReverseGeocode";

const PAGE_SIZE = 12;

export default class PropertyListMap extends NavigationMixin(LightningElement) {
  // Address and geolocation information
  apiUrl = "https://ipwho.is/";
  locGot = false;
  userAddress;
  zoomLevel;
  listView;
  center;
  newMapMarker;
  selectedMarkerValue;
  geoLat = 0;
  geoLong = 0;
  mapIcon = {
    path: "M6.1299-28.3483H5.7798C6.8433-29.5843 7.49-31.1861 7.49-32.9398 7.4899-36.8334 4.3219-40 .4305-40-3.4625-40-6.6279-36.8334-6.6279-32.9398-6.6279-31.1861-5.9802-29.5843-4.9186-28.3483H-5.2696C-7.2341-28.3483-8.8322-26.7486-8.8322-24.7838V-13.0733C-8.8322-11.1085-7.234-9.51-5.2696-9.51H-5.1324V3.297C-5.1324 5.3302-4.0627 6.8615-2.644 6.8615H3.5028C4.9236 6.8615 5.9936 5.3303 5.9936 3.297V-9.51H6.1299C8.0941-9.51 9.6938-11.1084 9.6938-13.0733V-24.7839C9.6932-26.7486 8.094-28.3483 6.1299-28.3483Z",
    fillColor: "#FFFF11",
    fillOpacity: 1
  };

  // For filters and marker information
  pageNumber = 1;
  pageSize = PAGE_SIZE;
  mapMarkers = [];
  markersRendered;
  searchKey = "";
  recordType = "Any";
  maxPrice = 50000;
  minBedrooms = 0;
  minBathrooms = 0;
  minRating = 0;
  streets = [];
  cities = [];
  distance = 0;

  // For tracking wired information
  @track properties;
  @track curProperties;
  @track allProperties;
  @track wiredProperties;
  @track error;
  @track propertyCount;

  @wire(MessageContext)
  messageContext;

  // Gets property list, repeatedly updated from filters
  @wire(getPagedPropertyList, {
    searchKey: "$searchKey",
    recordType: "$recordType",
    maxPrice: "$maxPrice",
    minBedrooms: "$minBedrooms",
    minBathrooms: "$minBathrooms",
    minRating: "$minRating",
    streets: "$streets",
    cities: "$cities",
    pageSize: "$propertyCount",
    pageNumber: "$pageNumber"
  })
  getPagedPropertyList(result) {
    this.properties = result;
    if (result.data) {
      this.curProperties = result.data;
      if (this.locGot) this.updateMarkers();
      else this.getLocation();
      this.error = undefined;
    } else if (result.error) {
      this.error = result.error;
      this.curProperties = [];
    }
  }

  // Gets list of all properties (above version uses page numbers from filters, due to grid having pages. This one gets every property to know how many to get markers for)
  @wire(getAllProperties) getAllProperties(result) {
    this.wiredAllProperties = result;

    if (result.data) {
      this.allProperties = result.data;
      this.propertyCount = this.allProperties.length;
      this.error = undefined;
    } else if (result.error) {
      this.error = result.error;
      this.allProperties = [];
    }
  }

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
        Latitude: "33.7760321146953",
        Longitude: "-84.3872206235533"
      }
    };

    this.mapMarkers = [];
    this.zoomLevel = 11;
    this.listView = "hidden";
  }

  updateMarkers() {
    // Reset map markers and refresh properties
    this.mapMarkers = [];
    // refreshApex(this.properties);

    // Multiple checks for information (otherwise, errors when anything was null)
    if (this.properties) {
      if (this.properties.data) {
        if (this.properties.data.records) {
          for (let i = 0; i < this.properties.data.records.length; i++) {
            // console.log(this.properties.data.records[i].Name, this.properties.data.records[i].Geolocation__Latitude__s, this.properties.data.records[i].Geolocation__Longitude__s);
            console.log(this.properties.data.records.length);
            if (!this.properties.data.records[i].Geolocation__Latitude__s && !this.properties.data.records[i].Geolocation__Longitude__s) {
              console.log("MISSING: ", this.properties.data.records[i].Name);
            }
            if(this.properties.data.records[i].Geolocation__Latitude__s && this.properties.data.records[i].Geolocation__Longitude__s) {
              // Create a new map marker using property's geolocation values
              this.newMapMarker = {
                location: {
                  // Street: this.properties.data.records[i].Billing_Street__c,
                  // City: this.properties.data.records[i].Billing_City__c,
                  // State: this.properties.data.records[i].Billing_State__c,
                  // PostalCode: this.properties.data.records[i].Billing_Postal_Code__c,
                  // Country: this.properties.data.records[i].Billing_Country__c
                  Latitude:
                    this.properties.data.records[i].Geolocation__Latitude__s,
                  Longitude:
                    this.properties.data.records[i].Geolocation__Longitude__s
                },
                value: this.properties.data.records[i].Id,
                title: this.properties.data.records[i].Billing_Street__c,
                description:
                  // this.properties.data.records[i].Billing_City__c + ", " + this.properties.data.records[i].Billing_State__c + " " + this.properties.data.records[i].Billing_Postal_Code__c
                  "Beds: " + this.properties.data.records[i].Bedrooms__c + ", Baths: " + this.properties.data.records[i].Bathrooms__c + ", Rent: $" + this.properties.data.records[i].Rent__c
              };
              this.mapMarkers.push(this.newMapMarker);
            }
          }
        }
      }
    }
    // If found, uses user's current location to display special marker, as well as circle outlining range set by inputted distance
    if (this.locGot) {
      this.newMapMarker = {
        location: {
          Latitude: this.geoLat,
          Longitude: this.geoLong
        },
        value: "userLocation",
        title: "Your Location",
        mapIcon: this.mapIcon
      };
      this.mapMarkers.push(this.newMapMarker);
      this.newMapMarker = {
        location: {
          Latitude: this.geoLat,
          Longitude: this.geoLong
        },
        type: "Circle",
        radius: this.distance * 1609.344,
        strokeColor: "#0000FF",
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: "#0000F0",
        fillOpacity: 0.35
      };
      this.mapMarkers.push(this.newMapMarker);
    }
  }

  disconnectedCallback() {
    unsubscribe(this.subscription);
    this.subscription = null;
  }

  // Updates values whenever filters have been changed
  handleFilterChange(filters) {
    this.searchKey = filters.searchKey;
    this.recordType = filters.recordType;
    this.maxPrice = filters.maxPrice;
    this.minBedrooms = filters.minBedrooms;
    this.minBathrooms = filters.minBathrooms;
    this.minRating = filters.minRating;
    this.streets = filters.streets;
    this.cities = filters.cities;
    this.distance = filters.distance;
    this.geoLat = filters.latitude;
    this.geoLong = filters.longitude;

    this.locGot = true;

    refreshApex(this.properties);
  }

  // When property marker selected
  handleMarkerSelect(event) {
    if (event.target.selectedMarkerValue !== "userLocation") {
      this.selectedMarkerValue = event.target.selectedMarkerValue;
      this.handlePropertySelected();
    }
  }

  // Message channel to other components when a property is selected
  handlePropertySelected() {
    const message = { propertyId: this.selectedMarkerValue };
    publish(this.messageContext, PROPERTYSELECTEDMC, message);
  }

  // Navigate to record page
  handleNavigateToRecord() {
    this[NavigationMixin.Navigate]({
      type: "standard__recordPage",
      attributes: {
        recordId: this.selectedMarkerValue,
        objectApiName: "Property__c",
        actionName: "view"
      }
    });
  }

  // Navigate to application page
  navigateToApplicationPage() {
    //set sessionStorage values
    sessionStorage.setItem("id", this.selectedMarkerValue);

    this[NavigationMixin.Navigate]({
      type: "standard__namedPage",
      attributes: {
        pageName: "application"
      }
    });
  }

  // Attempts to retrieve user's current geolocation
  getLocation() {
    console.log("Getting location...");
    navigator.permissions.query({ name: "geolocation" }).then((geoStatus) => {
      console.log(geoStatus.state);
      if (geoStatus.state === "granted" || geoStatus.state === "prompt") {
        navigator.geolocation.getCurrentPosition((position) => {
          this.geoLat = position.coords.latitude;
          this.geoLong = position.coords.longitude;
          console.log("WEB: " + this.geoLat + " " + this.geoLong);
          publish(this.messageContext, GOTUSERLOCATIONMC, {
            latitude: this.geoLat,
            longitude: this.geoLong
          });
          this.locGot = true;
          this.updateMarkers();
        });
      } else {
        fetch(this.apiUrl)
          .then((response) => response.json())
          .then((data) => {
            this.geoLat = data.latitude;
            this.geoLong = data.longitude;
            console.log("API: " + this.geoLat + " " + this.geoLong);
            publish(this.messageContext, GOTUSERLOCATIONMC, {
              latitude: this.geoLat,
              longitude: this.geoLong
            });
            this.locGot = true;
            this.updateMarkers();
          })
          .catch((error) => {
            console.log(error);
            this.updateMarkers();
            return false;
          });
      }
    });
  }
}