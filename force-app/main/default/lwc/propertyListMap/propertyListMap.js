import { LightningElement, wire, track } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import { refreshApex } from '@salesforce/apex';
import { publish, subscribe, unsubscribe, MessageContext } from 'lightning/messageService';
import FILTERSCHANGEMC from '@salesforce/messageChannel/FiltersChange__c';
import getPagedPropertyList from '@salesforce/apex/PropertyController.getPagedPropertyList';
import getAllProperties from '@salesforce/apex/getProperties.getAllProperties';
import ATLANTIS_LOGO from '@salesforce/resourceUrl/AtlantisLogo';
import CXPW_LOGO from '@salesforce/resourceUrl/CXPWLogo';
import MOORELAND_LOGO from '@salesforce/resourceUrl/MoorelandLogo';

const PAGE_SIZE = 12;

export default class PropertyListMap extends NavigationMixin(LightningElement) {
  // Address and geolocation information
  apiUrl = 'https://ipwho.is/';
  locGot = false;
  userAddress;
  zoomLevel;
  listView;
  center;
  selectedName;
  selectedCompany;
  selectedLogo = ATLANTIS_LOGO;
  cxpwEnabled = false;
  moorelandEnabled = false;
  partnersEnabled = false;
  newMapMarker;
  selectedMarkerValue;
  addressLat;
  addressLon;
  geoLat = 0;
  geoLon = 0;
  mapIcon;

  // For filters and marker information
  pageNumber = 1;
  pageSize = PAGE_SIZE;
  mapMarkers = [];
  markersRendered;
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
    searchKey: '$searchKey',
    recordType: '$recordType',
    maxPrice: '$maxPrice',
    minBedrooms: '$minBedrooms',
    minBathrooms: '$minBathrooms',
    minRating: '$minRating',
    propsInDistance: '$propsInDistance',
    pageSize: '$propertyCount',
    pageNumber: '$pageNumber',
    companies: '$companies',
    filteringDistance: '$filteringDistance'
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
    // Subscribe to message channel
    this.subscription = subscribe(
      this.messageContext,
      FILTERSCHANGEMC,
      (message) => {
        this.handleFilterChange(message);
      }
    );

    // Center map on Atlanta
    this.center = {
      location: {
        Latitude: "33.7760321146953",
        Longitude: "-84.3872206235533"
      }
    };

    // Map information
    this.mapMarkers = [];
    this.zoomLevel = 11;
    this.listView = "hidden";
  }

  updateMarkers() {
    // Reset map markers and refresh properties
    this.mapMarkers = [];

    // Multiple checks for information (otherwise, errors when anything was null)
    if (this.properties) {
      if (this.properties.data) {
        if (this.properties.data.records) {
          for (let i = 0; i < this.properties.data.records.length; i++) {
            if(this.properties.data.records[i].Geolocation__Latitude__s && this.properties.data.records[i].Geolocation__Longitude__s) {
              // Create a new map marker using property's geolocation values
              this.newMapMarker = {
                location: {
                  Latitude: this.properties.data.records[i].Geolocation__Latitude__s,
                  Longitude: this.properties.data.records[i].Geolocation__Longitude__s
                },
                value: this.properties.data.records[i].Id,
                title: this.properties.data.records[i].Billing_Street__c,
                description: "Beds: " + this.properties.data.records[i].Bedrooms__c + ", Baths: " + this.properties.data.records[i].Bathrooms__c + ", Rent: $" + this.properties.data.records[i].Rent__c
              };
              this.mapMarkers.push(this.newMapMarker);
            }
          }
        }
      }
    }
    // For user location distance filtering, display marker and circle outlining range
    if (this.filteringDistance && this.useLocation && this.geoLat && this.geoLon) {
      this.newMapMarker = {
        location: {
          Latitude: this.geoLat,
          Longitude: this.geoLon
        },
        value: "userLocation",
        title: "Your Location",
        mapIcon: {
          path: "M6.1299-28.3483H5.7798C6.8433-29.5843 7.49-31.1861 7.49-32.9398 7.4899-36.8334 4.3219-40 .4305-40-3.4625-40-6.6279-36.8334-6.6279-32.9398-6.6279-31.1861-5.9802-29.5843-4.9186-28.3483H-5.2696C-7.2341-28.3483-8.8322-26.7486-8.8322-24.7838V-13.0733C-8.8322-11.1085-7.234-9.51-5.2696-9.51H-5.1324V3.297C-5.1324 5.3302-4.0627 6.8615-2.644 6.8615H3.5028C4.9236 6.8615 5.9936 5.3303 5.9936 3.297V-9.51H6.1299C8.0941-9.51 9.6938-11.1084 9.6938-13.0733V-24.7839C9.6932-26.7486 8.094-28.3483 6.1299-28.3483Z",
          fillColor: "#FFFF11",
          fillOpacity: 1
        }
      };
      this.mapMarkers.push(this.newMapMarker);
      this.newMapMarker = {
        location: {
          Latitude: this.geoLat,
          Longitude: this.geoLon
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
    // For address distance filtering, display marker and circle outlining range
    if (this.filteringDistance && !this.useLocation && this.addressLat & this.addressLon) {
      this.newMapMarker = {
        location: {
          Latitude: this.addressLat,
          Longitude: this.addressLon
        },
        value: "thisAddress",
        title: "This Address",
        mapIcon: {
          path: "M6.1299-28.3483H5.7798C6.8433-29.5843 7.49-31.1861 7.49-32.9398 7.4899-36.8334 4.3219-40 .4305-40-3.4625-40-6.6279-36.8334-6.6279-32.9398-6.6279-31.1861-5.9802-29.5843-4.9186-28.3483H-5.2696C-7.2341-28.3483-8.8322-26.7486-8.8322-24.7838V-13.0733C-8.8322-11.1085-7.234-9.51-5.2696-9.51H-5.1324V3.297C-5.1324 5.3302-4.0627 6.8615-2.644 6.8615H3.5028C4.9236 6.8615 5.9936 5.3303 5.9936 3.297V-9.51H6.1299C8.0941-9.51 9.6938-11.1084 9.6938-13.0733V-24.7839C9.6932-26.7486 8.094-28.3483 6.1299-28.3483Z",
          fillColor: "#00D100",
          fillOpacity: 1
        }
      };
      this.mapMarkers.push(this.newMapMarker);
      this.newMapMarker = {
        location: {
          Latitude: this.addressLat,
          Longitude: this.addressLon
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
    this.propsInDistance = filters.propsInDistance;
    this.distance = filters.distance;
    this.useLocation = filters.useLocation;
    this.filteringDistance = filters.filteringDistance;
    this.geoLat = filters.userLatitude;
    this.geoLon = filters.userLongitude;
    this.addressLat = filters.addressLatitude;
    this.addressLon = filters.addressLongitude;
    this.locGot = filters.locGot;
    this.cxpwEnabled = filters.cxpwEnabled;
    this.moorelandEnabled = filters.moorelandEnabled;
    this.companies = filters.companies;
    this.updateMapFocus();
    this.updatePartners();

    this.locGot = true;

    refreshApex(this.properties);
  }

  // Update map zoom level and centering based on distance filtering or partner status
  updateMapFocus() {
    if (this.filteringDistance && this.useLocation && this.geoLat && this.geoLon) {
      // Priority 1: Distance Filter w/ User Location: Focus On User Coordinates
      this.zoomLevel = 11;
      this.center = {
        location: {
          Latitude: this.geoLat,
          Longitude: this.geoLon
        }
      };
    } else if (this.filteringDistance && this.addressLat && this.addressLon) {
      // Priority 2: Distance Filter w/ Inputted Address: Focus on Address Coordinates
      this.zoomLevel = 11;
      this.center = {
        location: {
          Latitude: this.addressLat,
          Longitude: this.addressLon
        }
      }
    } else if (this.cxpwEnabled || this.moorelandEnabled) {
      // Priority 3: Partner(s) Enabled & No Distance Filtering: Focus on United States
      this.zoomLevel = 4;
      this.center = {
        location: {
          Latitude: "40.806862",
          Longitude: "-96.681679"
        }
      };
    } else {
      // Priority 4: No Partners Enabled & No Distance Filtering: Focus on Atlanta
      this.zoomLevel = 11;
      this.center = {
        location: {
          Latitude: "33.7760321146953",
          Longitude: "-84.3872206235533"
        }
      };
    }
  }

  // Determine if company logos should be displayed based on if partners enabled
  updatePartners() {
    if (this.cxpwEnabled || this.moorelandEnabled) {
      this.partnersEnabled = true;
    } else {
      this.partnersEnabled = false;
    }
  }

  // When property marker selected
  handleMarkerSelect(event) {
    if (event.target.selectedMarkerValue !== "userLocation" && event.target.selectedMarkerValue !== "thisAddress") {
      this.selectedMarkerValue = event.target.selectedMarkerValue;
      this.getPropertyInfo(this.selectedMarkerValue);
    }
  }

  // Update name and company of selected property (given Id) for template to use
  getPropertyInfo(propertyId) {
    for (let i = 0; i < this.properties.data.records.length; i++) {
      if (propertyId == this.properties.data.records[i].Id) {
        this.selectedName = this.properties.data.records[i].Billing_Street__c;
        this.selectedCompany = this.properties.data.records[i].Origin_Company__c;
      }
    }
    switch (this.selectedCompany) {
      case 'Atlantis':
        this.selectedLogo = ATLANTIS_LOGO;
        break;
      case 'CXPW':
        this.selectedLogo = CXPW_LOGO;
        break;
      case 'Mooreland':
        this.selectedLogo = MOORELAND_LOGO;
        break;
      default:
        this.selectedLogo = ATLANTIS_LOGO;
    }
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

    switch (this.selectedCompany) {
      case 'Atlantis':
        this[NavigationMixin.Navigate]({
          type: "standard__namedPage",
          attributes: {
            pageName: "application"
          }
        });
        break;
      case 'CXPW':
        this[NavigationMixin.Navigate]({
          type: "standard__webPage",
          attributes: {
            url: 'https://smoothstack9-dev-ed.develop.my.site.com/cxpw/s/'
          }
        });
        break;
      case 'Mooreland':
        this[NavigationMixin.Navigate]({
          type: "standard__webPage",
          attributes: {
            url: 'https://smoothstack35-dev-ed.develop.my.site.com/accountportal/s/'
          }
        });
        break;
      default:
        // default
    }
  }

  // Attempts to retrieve user's current geolocation
  getLocation() {
    navigator.permissions.query({ name: "geolocation" }).then((geoStatus) => {
      if (geoStatus.state === "granted" || geoStatus.state === "prompt") {
        navigator.geolocation.getCurrentPosition((position) => {
          this.geoLat = position.coords.latitude;
          this.geoLon = position.coords.longitude;
          this.locGot = true;
          publish(this.messageContext, GOTUSERLOCATIONMC, {
            latitude: this.geoLat,
            longitude: this.geoLon,
            locGot: this.locGot
          });
          this.updateMarkers();
        });
      } else {
        fetch(this.apiUrl)
          .then((response) => response.json())
          .then((data) => {
            this.geoLat = data.latitude;
            this.geoLon = data.longitude;
            this.locGot = true;
            publish(this.messageContext, GOTUSERLOCATIONMC, {
              latitude: this.geoLat,
              longitude: this.geoLon,
              locGot: this.locGot
            });
            this.updateMarkers();
          })
          .catch(() => {
            this.updateMarkers();
            return false;
          });
      }
    });
  }
}