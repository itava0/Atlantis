import { LightningElement, api, track } from "lwc";
import RentalRateAPI from "@salesforce/apex/RentalRateAPI.RentalRateAPI";

export default class RentalRateCalculator extends LightningElement {
  @api propertyId;
  @track rent;
  @track min
  @track max;
  @track error;
  @track isShowModal = false;
  @track isLoading = false;

  @api get recordId() {
    return this.propertyId;
  }

//A method that loads rental rate data using the 
//RentalRateAPI Apex method and then calls the calculateRent() 
//method to calculate the average, minimum, and maximum rental rates for 
//the property.
async handleLoad() {
    this.isLoading = true;
    try {
      const rentalRateData = await RentalRateAPI({ propertyId: this.propertyId });
      const parsedData = JSON.parse(rentalRateData);
      const rentPrices = [
        parsedData.data.counties[0]['One-Bedroom'],
        parsedData.data.counties[0]['Two-Bedroom'],
        parsedData.data.counties[0]['Three-Bedroom'],
        parsedData.data.counties[0]['Four-Bedroom'],
      ];
      this.calculateRent(rentPrices);
      this.isLoading = false;
    } catch (error) {
      console.log(`Error retrieving rental rate data for property ${this.propertyId}: ${error}`);
      this.error = error;
    } finally {
      this.isLoading = false;
    }
  }
  


// A method that calculates the average, minimum, and maximum rental rates for the property 
//based on the rental rate data passed in as the data parameter.
calculateRent(data) {
    const sum = data.reduce((acc, val) => acc + val, 0);
    const count = data.length;
    this.rent = Math.round(sum / count);
    this.min = Math.min(...data);
    this.max = Math.max(...data);
  }

  showModalBox() {
    this.isShowModal = true;
    this.handleLoad();
  }

  hideModalBox() {
    this.isShowModal = false;
  }
}
