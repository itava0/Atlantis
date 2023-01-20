import { LightningElement, api, wire, track } from "lwc";
import { getRecord } from "lightning/uiRecordApi";
import {
  subscribe,
  unsubscribe,
  MessageContext
} from "lightning/messageService";
import PROPERTYSELECTEDMC from "@salesforce/messageChannel/PropertySelected__c";
import getChargingStations from "@salesforce/apex/EVLocations.getChargingStations";
import { connectionTypes, carToConnectorMap } from "./evData";

const fields = [
  "Property__c.Name",
  "Property__c.Billing_Street__c",
  "Property__c.Billing_City__c",
  "Property__c.Billing_State__c",
  "Property__c.Billing_Postal_Code__c",
  "Property__c.Billing_Country__c",
  "Property__c.Geolocation__Latitude__s",
  "Property__c.Geolocation__Longitude__s"
];

export default class PropertyMap extends LightningElement {
  address;
  error;
  propMarker;
  @track markers = [];
  @api propertyId;
  subscription = null;
  zoomLevel = 14;
  center = {};
  filter = [];
  response;

  @wire(MessageContext)
  messageContext;

  @wire(getRecord, { recordId: "$propertyId", fields })
  wiredRecord({ error, data }) {
    if (data) {
      //Reset values
      this.markers = [];
      this.error = undefined;

      //Define property object and location
      const property = data.fields;
      this.address = `${property.Billing_Street__c.value}, ${property.Billing_City__c.value}`;

      //Define map center
      this.center = 
        {
          location: {
            Latitude: property.Geolocation__Latitude__s.value,
            Longitude: property.Geolocation__Longitude__s.value
          }
        };

      //Get charging stations
      this.getStations(property.Geolocation__Latitude__s.value, property.Geolocation__Longitude__s.value);

      //Create marker for property
      this.propMarker = 
        {
          location: {
            Latitude: property.Geolocation__Latitude__s.value,
            Longitude: property.Geolocation__Longitude__s.value
          },
          title: `${property.Name.value}`,
          description: `<b>Address</b>: ${property.Billing_Street__c.value}`,
          mapIcon: {
            path: "m 572 -38 v 480 q 0 26 -19 45 t -45 19 h -384 v -384 h -256 v 384 h -384 q -26 0 -45 -19 t -19 -45 v -480 q 0 -1 0.5 -3 t 0.5 -3 l 575 -474 l 575 474 q 1 2 1 6 z m 223 -69 l -62 74 q -8 9 -21 11 h -3 q -13 0 -21 -7 l -692 -577 l -692 577 q -12 8 -24 7 q -13 -2 -21 -11 l -62 -74 q -8 -10 -7 -23.5 t 11 -21.5 l 719 -599 q 32 -26 76 -26 t 76 26 l 244 204 v -195 q 0 -14 9 -23 t 23 -9 h 192 q 14 0 23 9 t 9 23 v 408 l 219 182 q 10 8 11 21.5 t -7 23.5 z",
            fillColor: "#f28b00",
            fillOpacity: 1,
            strokeWeight: 1,
            scale: 0.02
          }
        };

    } else if (error) {
      this.error = error;
      this.address = undefined;
      this.markers = [];
    }
  }

  @api
  get recordId() {
    return this.propertyId;
  }
  set recordId(propertyId) {
    this.propertyId = propertyId;
  }

  getStations(propLat, propLon) {
    //Define description variable for string building

    //Call apex method to get local charging stations, iterate through results and build markers
    getChargingStations({ lat: parseFloat(propLat), lon: parseFloat(propLon)}).then(result => {
      this.response = JSON.parse(result);
        this.setMapMarkers();
      })
      .catch(err => console.log("err:", err));
  }

  //Returns connector type from connectionTypes array based on ID
  filterIt(arr, searchID) {
    return arr.filter(obj => { return obj.ID === searchID });
  }

  setMapMarkers() {
    let description = '';
    this.markers = [];
    this.markers = [...this.markers, this.propMarker];
    this.response.forEach(station => {
      var filtered = false;
      if(this.filter.length === 0) {filtered = true;}
      if(station.Connections.forEach(connection => {if(this.filter.includes(connection.ConnectionTypeID)) {filtered = true;}}));
      if(filtered) {
        //Start building marker description string
        description = `<b>Distance</b>: ${station.AddressInfo.Distance.toFixed(2)} miles`;
        if(station.AddressInfo.AddressLine1 !== undefined) {
          description += `<br><b>Location</b>: ${station.AddressInfo.AddressLine1}`;
        }

        //Add connections to description string
        description += '<br><b>Connections</b>: ';
        station.Connections.forEach(connection => {
          this.filterIt(connectionTypes, connection.ConnectionTypeID).forEach(plug => {
            description += `<br>${connection.Quantity}x ${plug.Title} <i>${connection.PowerKW}kW</i>`;
          });
        });

        //Add comments to description string
        if(station.GeneralComments !== undefined) {
          description += `<br><b>Comments</b>: ${station.GeneralComments}`;
        }

        //Add marker to array
        this.markers = [...this.markers,
        {
          location: {
            Latitude: station.AddressInfo.Latitude,
            Longitude: station.AddressInfo.Longitude
          },
          title: `Charging station ID: ${station.ID}`,
          description: description,
          mapIcon: {
            path: "m 1.3 -9 c 0.4 0.2 0.7 0.6 0.7 1 v 5 l 4 0 c 0.4 0 0.7 0.2 0.9 0.5 c 0.2 0.4 0.1 0.8 -0.1 1.1 l -7 10 c -0.2 0.3 -0.7 0.5 -1.1 0.4 c -0.4 -0.2 -0.7 -0.6 -0.7 -1 l 0 -5 h -4 c -0.4 0 -0.7 -0.2 -0.9 -0.5 c -0.2 -0.4 -0.1 -0.8 0.1 -1.1 l 7 -10 c 0.2 -0.3 0.7 -0.5 1.1 -0.4 z",
            fillColor: "#2222ff",
            fillOpacity: 1,
            strokeWeight: 1,
            scale: 1
          }
        }];
      }
    });
  }

  get options() {
    return [
        { label: "Tesla", value: "Tesla" },
        { label: "CSS", value: "CSS" },
        { label: "CHAdeMO", value: "CHAdeMO" },
        { label: "J1772", value: "J1772" },
    ];
  }

  handleChange() {
    this.filter = [];
    this.template.querySelectorAll("input").forEach(element => {
      console.log(element.checked);
      if(element.checked) {
        carToConnectorMap[element.value].forEach(id => {
          this.filter.push(id);
        });
      }
    });
    this.setMapMarkers();
  }

  connectedCallback() {
    this.subscription = subscribe(
      this.messageContext,
      PROPERTYSELECTEDMC,
      (message) => {
        this.handlePropertySelected(message);
      }
    );
  }

  disconnectedCallback() {
    unsubscribe(this.subscription);
    this.subscription = null;
  }

  handlePropertySelected(message) {
    this.propertyId = message.propertyId;
  }
}