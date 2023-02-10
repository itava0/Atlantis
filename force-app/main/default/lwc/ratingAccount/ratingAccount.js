import { LightningElement, api, wire, track } from "lwc";
import { refreshApex } from "@salesforce/apex";
import { deleteRecord } from "lightning/uiRecordApi";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import ACCOUNT_OBJECT from "@salesforce/schema/Account";
import NAME_FIELD from "@salesforce/schema/Account.Name";
import OVERALL_SCORE_FIELD from "@salesforce/schema/Account.Score__c";
import OVERALL_RATING_FIELD from "@salesforce/schema/Account.Rating__c";
import RATING_COUNT_FIELD from "@salesforce/schema/Account.Rating_Count__c";
import RATING_OBJECT from "@salesforce/schema/AccRating__c";
import SCORE_FIELD from "@salesforce/schema/AccRating__c.Score__c";
import REVIEW_FIELD from "@salesforce/schema/AccRating__c.Review__c";
import ID_FIELD from "@salesforce/user/Id";
import getPropertyOwners from '@salesforce/apex/getProperties.getPropertyOwnersFromProperty';
import getAccount from "@salesforce/apex/getProperties.getAccountName";
import getRatings from "@salesforce/apex/getProperties.getMultipleRatings";
import getAccounts from "@salesforce/apex/getProperties.getMultipleAccounts";

export default class RatingAccount extends LightningElement {
    accountObj = ACCOUNT_OBJECT;
    name = NAME_FIELD;
    overallScore = OVERALL_SCORE_FIELD;
    overallRating = OVERALL_RATING_FIELD;
    countRating = RATING_COUNT_FIELD;
    userId = ID_FIELD;
    @api propertyId;
    @track recordId;
    @track ratingCount;
    @track error;

    // Tracking information from wired queries
    @track ratingId = "";
    @track wiredRatings = [];
    @track ratings = [];
    @track myRatings = [];
    @track ratingIds = [];
    @track wiredAccounts = [];
    @track accounts = [];
    @track accountIds = [];
    @track wiredPropertyOwners = [];
    @track propertyOwners = [];

    // Various rating status information
    ratingObj = RATING_OBJECT;
    hasRating = false;
    ratingFound = false;
    wasDeleted = false;
    hasPropertyOwner = false;
    multiplePropertyOwners = false;
    fields = [SCORE_FIELD, REVIEW_FIELD];
    score = SCORE_FIELD;
    review = REVIEW_FIELD;
    currentScore;
    currentReview;
    accId;
    accName;
    @track accNames = [];

    // Get Property Owners from Property
    @wire(getPropertyOwners, { propId: "$propertyId" }) getPropertyOwners(result) {
        this.wiredPropertyOwners = result;
        if (result.data) {
            this.propertyOwners = result.data;
            this.accountIds = [];
            // Push list of property owners
            if (this.propertyOwners.length > 0) {
                for (let i = 0; i < this.propertyOwners.length; i++) {
                    this.accountIds.push(this.propertyOwners[i].Account__c);
                }
                this.hasPropertyOwner = true;
                // Get ID (will default to first one, but can be changed)
                this.accId = this.accountIds[0];
            }
            // Check if there are multiple property owners
            if (this.propertyOwners.length > 1) {
                this.multiplePropertyOwners = true;
            }
            this.error = undefined;
        } else if (result.error) {
            this.error = result.error;
            this.propertyOwners = [];
        }
    }

    // Get Account Name from Account Id
    @wire(getAccount, { accId: "$accId" }) getAccount(result) {
        if (result.data) {
            this.accNames = result.data;
            if (this.accNames.length > 0) {
                this.accName = this.accNames[0].Name;
                this.error = undefined;
            }
        } else if (result.error) {
            this.error = result.error;
            
        }
    }

    // Get Accounts from Property Owners
    @wire(getAccounts, { accIds : "$accountIds" }) getAccounts(result) {
        this.wiredAccounts = result;
        if (result.data) {
            this.accounts = result.data;
            this.error = undefined;
        } else if (result.error) {
            this.error = result.error;
            console.log(this.error);
            this.accounts = [];
        }
    }

    // Get Ratings to Update or Delete
    @wire(getRatings, { accIds: "$accountIds", usrId: "$userId"}) getRatings(result) {
        this.wiredRatings = result;

        if (result.data) {
            this.ratings = result.data;
            this.myRatings = [];
            this.ratingIds = [];
            if (this.ratings.length > 0) {
                for (let i = 0; i < this.ratings.length; i++) {
                    this.myRatings.push(this.ratings[i]);
                    this.ratingIds.push(this.ratings[i].Id);
                    // If a rating exists that matches the default (first) accId, then display that rating
                    if (this.ratings[i].Account__c == this.accId) {
                        this.ratingId = this.ratings[i].Id;
                        this.hasRating = true;
                    }   
                }
                
                this.error = undefined;
            }
        } else if (result.error) {
            this.error = result.error;
            this.ratings = [];
            this.myRatings = [];
            this.ratingIds = [];
        }
    }

    // Change Account Information When Tab Clicked
    updateTab(event) {
        this.accId = event.target.value;
        this.hasRating = false;
        this.ratingFound = false;
        for (let i = 0; i < this.ratings.length; i++) {
            if (this.ratings[i].Account__c == this.accId) {
                for (let j = 0; j < this.ratingIds.length; j++) {
                    if (this.ratingIds[j] == this.ratings[i].Id) {
                        // A rating for this account already exists
                        this.ratingId = this.ratings[i].Id;
                        this.currentScore = this.ratings[i].Score__c;
                        this.currentReview = this.ratings[i].Review__c;
                        this.hasRating = true;
                        this.wasDeleted = false;
                        this.ratingFound = true;
                    }
                }
            }
        }
    }

    // Update rating score
    handleScoreChange(event) {
        this.currentScore = event.target.value;
    }

    // Update review
    handleReviewChange(event) {
        this.currentReview = event.target.value;
    }

    // Insert/update form submission
    handleSubmit(event) {
        if (this.hasRating) {
            // When updating existing rating
            event.preventDefault();

            const formFields = event.detail.fields;
            formFields.Score__c = this.currentScore;
            formFields.Review__c = this.currentReview;
            this.template.querySelector("lightning-record-edit-form").update(formFields);
        } else {
            // When submitting new rating
            event.preventDefault();

            const formFields = event.detail.fields;
            formFields.Account__c = event.target.value;
            formFields.User__c = this.userId;
            formFields.Score__c = this.currentScore;
            formFields.Review__c = this.currentReview;

            this.template.querySelector("lightning-record-edit-form").submit(formFields);
        }
    }

    // Insert/update form success
    handleSuccess(event) {
        if (this.hasRating) {
            // When updating existing rating
            const evt = new ShowToastEvent({
                title: "Rating updated",
                // message: event.detail.id,
                variant: "success"
            });
            // this.ratingId = event.detail.id;
            this.dispatchEvent(evt);
            return refreshApex(this.wiredRatings);
        } else {
            // When submitting new rating
            const evt = new ShowToastEvent({
                title: "Rating submitted",
                // message: event.detail.id,
                variant: "success"
            });
            this.ratingId = event.detail.id;
            this.myRatings.push(event.detail);
            this.ratingIds.push(this.ratingId);
            this.dispatchEvent(evt);
            this.wasDeleted = false;
            this.hasRating = true;
            return refreshApex(this.wiredRatings);
        }
    }

    // Delete form submission
    handleDelete(event) {
        // Delete Rating
        deleteRecord(this.ratingId)
        .then(() => {
            // On success
            const toastEvt = new ShowToastEvent({
                title: "Rating deleted",
                variant: "error"
            });
            this.dispatchEvent(toastEvt);

            // Delete Rating from List
            const index = this.myRatings.indexOf(event.target.value);
            if (index > -1) {
                this.myRatings.splice(index, 1);
            }
            const index2 = this.ratingIds.indexOf(event.target.value);
            if (index2 > -1) {
                this.ratingIds.splice(index2, 1);
            }
            this.wasDeleted = true;
            this.hasRating = false;
            return refreshApex(this.wiredRatings);
        })
        .catch((error) => {
            // On error
            const toastEvt = new ShowToastEvent({
                title: "Error deleting rating",
                message: error.message,
                variant: "warning"
            });
            this.dispatchEvent(toastEvt);
        });
    }
}