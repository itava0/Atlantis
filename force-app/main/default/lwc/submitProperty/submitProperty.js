import { LightningElement, track} from 'lwc';
import saveRecord from '@salesforce/apex/PropertyController.newProperty';
import { NavigationMixin } from 'lightning/navigation';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
const MAX_FILE_SIZE = 30000000;

// Record Type IDs for properties
const APARTMENT_ID = '012Dn000000gZGMIA2';
const SINGLE_FAMILY_ID = '012Dn000000gZGqIAM';
const TOWNHOUSE_ID = '012Dn000000gZGRIA2';

export default class SubmitProperty extends NavigationMixin(LightningElement) {
    // Tracking inputted parameters for fields
    @track name;
    @track street;
    @track city = 'Atlanta';
    @track state = 'Georgia';
    @track postalCode;
    @track country = 'United States of America';
    @track marketPrice;
    @track rent;
    @track status = 'Available';
    @track dateListed;
    @track bedrooms;
    @track bathrooms;
    @track recordType = APARTMENT_ID;

    // For handling uploading an image file
    uploadedFiles = [];
    file;
    fileContents;
    fileReader;
    content;
    fileName;
    fileUploaded = false;
    errorMsg;

    // Options for Billing State field
    stateOptions = [
        { label: "Alabama", value: "Alabama" },
        { label: "Alaska", value: "Alaska" },
        { label: "Arizona", value: "Arizona" },
        { label: "Arkansas", value: "Arkansas" },
        { label: "California", value: "California" },
        { label: "Colorado", value: "Colorado" },
        { label: "Connecticut", value: "Connecticut" },
        { label: "Delaware", value: "Delaware" },
        { label: "District of Columbia", value: "District of Columbia" },
        { label: "Florida", value: "Florida" },
        { label: "Georgia", value: "Georgia" },
        { label: "Hawaii", value: "Hawaii" },
        { label: "Idaho", value: "Idaho" },
        { label: "Illinois", value: "Illinois" },
        { label: "Indiana", value: "Indiana" },
        { label: "Iowa", value: "Iowa" },
        { label: "Kansas", value: "Kansas" },
        { label: "Kentucky", value: "Kentucky" },
        { label: "Louisiana", value: "Louisiana" },
        { label: "Maine", value: "Maine" },
        { label: "Maryland", value: "Maryland" },
        { label: "Massachusetts", value: "Massachusetts" },
        { label: "Michigan", value: "Michigan" },
        { label: "Minnesota", value: "Minnesota" },
        { label: "Mississippi", value: "Mississippi" },
        { label: "Missouri", value: "Missouri" },
        { label: "Montana", value: "Montana" },
        { label: "Nebraska", value: "Nebraska" },
        { label: "Nevada", value: "Nevada" },
        { label: "New Hampshire", value: "New Hampshire" },
        { label: "New Jersey", value: "New Jersey" },
        { label: "New Mexico", value: "New Mexico" },
        { label: "New York", value: "New York" },
        { label: "North Carolina", value: "North Carolina" },
        { label: "North Dakota", value: "North Dakota" },
        { label: "Ohio", value: "Ohio" },
        { label: "Oklahoma", value: "Oklahoma" },
        { label: "Oregon", value: "Oregon" },
        { label: "Pennsylvania", value: "Pennsylvania" },
        { label: "Rhode Island", value: "Rhode Island" },
        { label: "South Carolina", value: "South Carolina" },
        { label: "South Dakota", value: "South Dakota" },
        { label: "Tennessee", value: "Tennessee" },
        { label: "Texas", value: "Texas" },
        { label: "Utah", value: "Utah" },
        { label: "Vermont", value: "Vermont" },
        { label: "Virginia", value: "Virginia" },
        { label: "Washington", value: "Washington" },
        { label: "West Virginia", value: "West Virginia" },
        { label: "Wisconsin", value: "Wisconsin" },
        { label: "Wyoming", value: "Wyoming" }
    ];

    // Only one option for Billing Country field
    countryOptions = [
        { label: "United States of America", value: "United States of America" }
    ];

    // Options for Status field
    statusOptions = [
        { label: "Available", value: "Available" },
        { label: "Rented", value: "Rented" }
    ];

    // Options for Record Type field
    recordTypeOptions = [
        { label: "Apartment", value: APARTMENT_ID },
        { label: "Single Family", value: SINGLE_FAMILY_ID },
        { label: "Townhouse", value: TOWNHOUSE_ID }
    ];

    // Form Update: Name
    handleNameChange(event) {
        this.name = event.detail.value;
    }

    // Form Update: Billing Street
    handleStreetChange(event) {
        this.street = event.detail.value;
    }

    // Form Update: Billing City
    handleCityChange(event) {
        this.city = event.detail.value;
    }

    // Form Update: Billing State
    handleStateChange(event) {
        this.state = event.detail.value;
    }

    // Form Update: Billing Postal Code
    handlePostalCodeChange(event) {
        this.postalCode = event.detail.value;
    }

    // Form Update: Billing Country
    handleCountryChange(event) {
        this.country = event.detail.value;
    }

    // Form Update: Market Price
    handleMarketPriceChange(event) {
        this.marketPrice = event.detail.value;
    }

    // Form Update: Rent
    handleRentChange(event) {
        this.rent = event.detail.value;
    }

    // Form Update: Status
    handleStatusChange(event) {
        this.status = event.detail.value;
    }

    // Form Update: Date Listed
    handleDateListedChange(event) {
        this.dateListed = event.detail.value;
    }

    // Form Update: Bedrooms
    handleBedroomsChange(event) {
        this.bedrooms = event.detail.value;
    }

    // Form Update: Bathrooms
    handleBathroomsChange(event) {
        this.bathrooms = event.detail.value;
    }

    // Form Update: Record Type
    handleRecordTypeChange(event) {
        this.recordType = event.detail.value;
    }

    // When a file is submitted for upload
    onFileUpload(event) {
        if (event.target.files.length == 1) {
            // Submit image for upload
            this.uploadedFiles = event.target.files;
            this.fileName = event.target.files[0].name;
            this.file = this.uploadedFiles[0];
            this.fileUploaded = true;
            // Display warning if image too large
            if (this.file.size > MAX_FILE_SIZE) {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Image File Too Large',
                        variant: 'warning',
                        message: 'Please upload a smaller image (3 MB or less)'
                    }),
                );
            }
        } else if (event.target.files.length > 1) {
            // Display warning if multiple images were uploaded
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Only 1 Image Allowed',
                    variant: 'warning',
                    message: 'Please upload only a single image'
                }),
            );
        }
    }

    saveProperty() {
        // If there is an image submitted for upload
        if (this.file) {
            // Read contents of file, preparing it for upload, then attempt to save the record
            this.fileReader = new FileReader();
            this.fileReader.onloadend = (() => {
                this.fileContents = this.fileReader.result;
                let base64 = 'base64,';
                this.content = this.fileContents.indexOf(base64) + base64.length;
                this.fileContents = this.fileContents.substring(this.content);
                this.saveRecord();
            });
            this.fileReader.readAsDataURL(this.file);
        } else {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'No Image Found',
                    variant: 'warning',
                    message: 'Please upload an image for the property'
                }),
            );
        }
    }

    saveRecord() {
        // Create new property record with inputted parameters
        var prop = {
            'sobjectType': 'Property__c',
            'Name': this.name,
            'Billing_Street__c': this.street,
            'Billing_City__c': this.city,
            'Billing_State__c': this.state,
            'Billing_Postal_Code__c': this.postalCode,
            'Billing_Country__c': this.country,
            'Market_Price__c': this.marketPrice,
            'Rent__c': this.rent,
            'Status__c': this.status,
            'Date_Listed__c': this.dateListed,
            'Bedrooms__c': this.bedrooms,
            'Bathrooms__c': this.bathrooms,
            'RecordTypeId': this.recordType,
            'Approval_Status__c': 'Pending'
        }
        saveRecord({
            propRec : prop,
            file : encodeURIComponent(this.fileContents),
            fileName : this.fileName
        }).catch(error => {
            this.errorMsg = error.body.message;

            // If a validation error is hit, display as such in a toast message
            if (this.errorMsg.includes('FIELD_CUSTOM_VALIDATION_EXCEPTION')) {
                this.errorMsg = 'Billing postal code must match billing state';
            } else if (this.errorMsg.includes('STRING_TOO_LONG')) {
                this.errorMsg = 'Billing postal code must be 5 characters';
            } else if (this.errorMsg.includes('REQUIRED_FIELD_MISSING')) {
                this.errorMsg = 'One or more required fields have not been entered';
            }
            
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error',
                    variant: 'error',
                    message: this.errorMsg
                }),
            );
        })
        .then(propId => {
            if (propId) {
                // Display success message
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Success',
                        variant: 'success',
                        message: 'Property submitted'
                    }),
                );
                // Navigate to new record page
                this[NavigationMixin.Navigate]({
                    type: 'standard__recordPage',
                    attributes: {
                        recordId: propId,
                        objectApiName: 'Property__c',
                        actionName: 'view'
                    },
                });
            }
        }).catch(error => {
            console.log('error: ', error);
        });
    }

    // When save button clicked, attempt to submit property
    handleSubmit(event) {
        event.preventDefault();
        this.saveProperty();
    }
}