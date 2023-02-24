import { LightningElement, wire, track } from 'lwc';
import { getRecord, getFieldValue } from "lightning/uiRecordApi";
import { refreshApex } from '@salesforce/apex';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import createCustomer from '@salesforce/apex/StripeHandler.createCustomer'
import createToken from '@salesforce/apex/StripeHandler.createToken'
import addCard from '@salesforce/apex/StripeHandler.addCard';
import viewAllCards from '@salesforce/apex/StripeHandler.viewAllCards';
import getCustomerInfo from '@salesforce/apex/StripeHandler.getCustomerInfo';
import getAccId from '@salesforce/apex/StripeHandler.getAccId';
import makePayment from '@salesforce/apex/StripeHandler.makePayment';
import getCard from '@salesforce/apex/StripeHandler.getCard';
import getLeasePricings from '@salesforce/apex/StripeHandler.getLeasePricings';
import updateRemainingAmount from '@salesforce/apex/StripeHandler.updateRemainingAmount';
import getCharge from '@salesforce/apex/StripeHandler.getCharge';
import createInvoice from '@salesforce/apex/StripeHandler.createInvoice';
import getInvoice from '@salesforce/apex/StripeHandler.getInvoice';
import getCustomerDefault from '@salesforce/apex/StripeHandler.getCustomerDefault';
import updateCustomerDefault from '@salesforce/apex/StripeHandler.updateCustomerDefault';
import setAutoPayments from '@salesforce/apex/StripeHandler.setAutoPayments';
import getAutoPayments from '@salesforce/apex/StripeHandler.getAutoPayments';
import deleteCard from '@salesforce/apex/StripeHandler.deleteCard';
import ACCOUNT_ID from '@salesforce/schema/Contact.AccountId'
import USER_ID from '@salesforce/user/Id';
import CONTACT_ID from '@salesforce/schema/User.ContactId'
import CONTACT_NAME from '@salesforce/schema/Contact.Name'
import CONTACT_EMAIL from '@salesforce/schema/Contact.Email'
import ACC_ID from '@salesforce/schema/Account.Id'
import REMAINING_AMOUNT from '@salesforce/schema/Account.Remaining_Amount__c'

export default class StripePayment extends LightningElement {
    cardNum;
    expMonth;
    expYear;
    cvc;
    customerId;
    tokenId;
    chargeId;
    cardId;
    accountId;
    cards = [];
    curCard;
    customerJSON;
    tempCard;
    showAddCard = false;
    leasePricings = [];
    invoiceId;
    invoice;
    defaultSource;
    defaultCard;
    autoPaymentEnabled = false;
    @track account;
    charge;
    loading = false;
    showChangeCardModal = false;
    currentDelete;


    @wire(getRecord, { recordId: USER_ID, fields: [CONTACT_ID] }) user;
    @wire(getRecord, { recordId: '$contactId', fields: [ACCOUNT_ID, CONTACT_NAME, CONTACT_EMAIL] }) contact;
    @wire(getRecord, { recordId: '$accountId', fields: [REMAINING_AMOUNT] })
    fetchAcc(response) {
        this.account = response;
    }

    //while getting the account, also grab the customer Id and any other needed info
    @wire(getAccId, {contactId: '$contactId'})
    gettingAccId(record) {
        if(record) {
            this.accountId = record.data;
            console.log("Account Id: ", this.accountId);
            createCustomer({accountId: this.accountId})
            .then((response) => {
                console.log("Create customer: ", response);
                this.customerId = response;
                console.log("customer Id: ", this.customerId);
                viewAllCards({
                    customerId: this.customerId
                })
                .then((response) => {
                    return JSON.parse(response);
                })
                .then((res) => {
                    this.cards = res.data
                        .map(row => ({ ...row, last4: "•••• •••• •••• "+row.last4, }));
                    if(this.cards.length > 0) {
                        this.curCard = this.cards[0];
                    }
                    console.log(this.cards);
                    console.log("cards length: ", this.cards.length);
                })
                .catch((error) =>{
                    console.log(error);
                })
            })
            .catch((error) => {
                console.log(error);
            })
            getAutoPayments({ accountId: this.accountId})
            .then((response) => {
                this.autoPaymentEnabled = response;
            })
            .catch((error) => {
                console.log(error);
            })
        }
        else {
            console.log("Error getting Account Id");
        }
    }

    @wire(getCustomerInfo,{customerId: '$customerId'})
    customerInfo(response) {
        if(response) {
            //console.log(response.data);
            this.customerJSON = response.data;
        }
        else {
            console.log("Customer info error");
        }
    }

    @wire(getLeasePricings, { accountId: '$accountId'})
    charges({error,data}) {
        if (data) {
            for (let key in data) {
                console.log(key);
                console.log(data[key]);
                this.leasePricings.push({value:parseFloat(data[key]).toFixed(2), key:key});
            }
        } else if (error) {
            window.console.log(error);
        }
    }

    get contactId() {
        console.log("conId", getFieldValue(this.user.data, CONTACT_ID));
        return getFieldValue(this.user.data, CONTACT_ID);
    }

    get customer() {
        return JSON.parse(this.customerJSON);
    }

    get contactName() {
        console.log("conName", getFieldValue(this.contact.data, CONTACT_NAME));
        return getFieldValue(this.contact.data, CONTACT_NAME);
    }
    
    get contactEmail() {
        console.log("conEmail", getFieldValue(this.contact.data, CONTACT_EMAIL));
        return getFieldValue(this.contact.data, CONTACT_EMAIL);
    }

    get balanceDue() {
        console.log("Remaining Amount ", getFieldValue(this.account.data, REMAINING_AMOUNT));
        return getFieldValue(this.account.data, REMAINING_AMOUNT);
    }

    get hasCards() {
        if(this.cards.length > 0) {
            return true;
        }
        else{
            return false;
        }
    }

    get curCardNumLabel() {
        return "•••• •••• •••• "+this.curCard.last4;
    }

    get curCardExpMonth() {
        return this.curCard.exp_month;
    }

    get curCardExpYear() {
        return this.curCard.exp_year;
    }

    get curMonth() {
        const month = ["January","February","March","April","May","June","July","August","September","October","November","December"];
        const d = new Date();
        return month[d.getMonth()];
    }

    get cannotPay() {
        console.log("Check if can pay ",parseFloat(getFieldValue(this.account.data, REMAINING_AMOUNT)));
        if(parseFloat(getFieldValue(this.account.data, REMAINING_AMOUNT)) == 0) {
            return true;
        }
        else {
            return false;
        }
    }

    cardNumHandler(event) {
        this.cardNum = event.target.value;
    }

    expMonthHandler(event) {
        this.expMonth = event.target.value;
    }

    expYearHandler(event) {
        this.expYear = event.target.value;
    }

    cvcHandler(event) {
        this.cvc = event.target.value;
    }

    // generic function to get return document element
    querySelectorHelper(element){
        return this.template.querySelector(element);
    }

    //Open the change payment method modal
    changePayment(){
        this.querySelectorHelper('.modalSection').classList.add('slds-fade-in-open');
        this.querySelectorHelper('.backdropDiv').classList.add('slds-backdrop_open');
        //Query the default card of the customer
        getCustomerDefault({ customerId: this.customerId })
        .then((response) => {
            console.log(response);
            this.defaultSource = response;
            //Have the default card say default
            this.template.querySelectorAll('lightning-button[data-id="defaultButton"]').forEach(element => {
                if(element.dataset.key == this.defaultSource) {
                    element.label = "Default";
                }
                else {
                    element.label = "Set default";
                }
            });
        })
        .catch((error) =>{
            console.log(error);
        })
    }

    //close the change payment modal
    closeModal(){
        this.querySelectorHelper('.modalSection').classList.remove('slds-fade-in-open');
        this.querySelectorHelper('.backdropDiv').classList.remove('slds-backdrop_open');
        //reset the select buttons
        this.template.querySelectorAll('lightning-button[data-id="selectButton"]').forEach(element => {
            element.label = "Select";
            element.variant = "neutral";
        });
        this.tempCard = null;
        this.showAddCard = false;
    }

    //hide modal for when opening confirmation modal
    hideModal(){
        this.querySelectorHelper('.modalSection').classList.remove('slds-fade-in-open');
        this.querySelectorHelper('.backdropDiv').classList.remove('slds-backdrop_open');
    }

    //open auto payment confirmation modal
    autoPaymentModal(){
        getCustomerDefault({ customerId: this.customerId })
        .then((response) => {
            this.defaultSource = response;
            getCard({ customerId: this.customerId, source: this.defaultSource})
            .then((response) => {
                return JSON.parse(response);
            })
            .then((res) => {
                this.defaultCard = res;
                this.defaultCard.last4 = "•••• •••• •••• "+this.defaultCard.last4;
            })
            .catch((error) =>{
                console.log(error);
            });
        })
        .catch((error) =>{
            console.log(error);
        });
        
        this.querySelectorHelper('.modalSection2').classList.add('slds-fade-in-open');
        this.querySelectorHelper('.backdropDiv').classList.add('slds-backdrop_open');
    }

    //close auto payment modal
    closeModal2(){
        this.querySelectorHelper('.modalSection2').classList.remove('slds-fade-in-open');
        this.querySelectorHelper('.backdropDiv').classList.remove('slds-backdrop_open');
    }

    //make the selected card the default card for the customer
    makeDefaultCard(event){
        updateCustomerDefault({ customerId: this.customerId, source: event.target.dataset.key })
        .then((response) => {

        })
        .catch((error) =>{
            console.log(error);
        })
        //make the current button card label default, while changing all others to set default
        this.template.querySelectorAll('lightning-button[data-id="defaultButton"]').forEach(element => {
            element.label = "Set default";
        });
        event.target.label = "Default";
    }

    //Store the current card as temp card
    useSelectedCard(event){
        console.log(event.target.dataset.key);
        this.template.querySelectorAll('lightning-button[data-id="selectButton"]').forEach(element => {
            element.label = "Select";
            element.variant = "neutral";
        });
        event.target.label = "Selected";
        event.target.variant="success";
        getCard({customerId: this.customerId, source: event.target.dataset.key})
        .then((response) => {
            return JSON.parse(response);
        })
        .then((res) => {
            this.tempCard = res;
        })
        .catch((error) =>{
            console.log(error);
        })
    }

    //remap some fields of an object
    objectMap(object, mapFn) {
        return Object.keys(object).reduce(function(result, key) {
          result[key] = mapFn(object[key])
          return result
        }, {})
    }

    //Use selected card and close modal
    saveSelection(event) {
        if(this.tempCard != null) {
            console.log(this.tempCard['last4']);
            this.curCard = this.tempCard;
            this.curCard.last4 = "•••• •••• •••• "+this.curCard.last4;
        }
        this.closeModal();
    }

    //Check if all form fields are filled in and are valid
    get cardFormValidation() {
        if(this.cardNum == null || this.expMonth == null || this.expYear == null || this.cvc == null) {
            return false;
        }
        if(this.cardNum.length == 16 && this.expMonth >= 0 && this.expMonth <= 12 &&
        (parseInt(this.expYear) >= 2024 || (parseInt(this.expYear) >= 2023 && 
        this.expMonth >= new Date().getMonth())) && this.cvc.toString().length == 3) {
            return true;
        }
        return false;
    }

    addNewCardToggle() {
        this.showAddCard = !this.showAddCard;
    }

    //Save card and add it to customer through Stripe API
    saveNewCard() {
        //If all form fields are filled in and are valid
        if(this.cardFormValidation) {
            //create token and then convert token into a payment method on the customer
            createToken({
                accountId: this.accountId,
                cardNumber: this.cardNum, 
                expMonth: this.expMonth, 
                expYear: this.expYear, 
                cvc: this.cvc})
            .then((response) => {
                console.log(response);
                this.tokenId = response;
                this.validCard = false;
                addCard({
                    customerId: this.customerId,
                    token: this.tokenId
                })
                .then((response) => {
                    console.log(response);
                    if(response[0] == "200") {
                        this.validCard = true;
                        this.cardId = response[1];
                        //Re-query all cards and map them into desired format
                        viewAllCards({
                            customerId: this.customerId
                        })
                        .then((response) => {
                            return JSON.parse(response);
                        })
                        .then((res) => {
                            this.cards = res.data
                                .map(row => ({ ...row, last4: "•••• •••• •••• "+row.last4, }));
                            if(this.cards.length > 0) {
                                this.curCard = this.cards[0];
                            }
                            console.log(this.cards);
                            this.showAddCard = !this.showAddCard;
                            getCard({customerId: this.customerId, source: this.cardId})
                            .then((response) => {
                                return JSON.parse(response);
                            })
                            .then((res) => {
                                this.tempCard = res;
                                console.log("cards length: ", this.cards.length);
                                
                                this.template.querySelectorAll('lightning-button[data-id="selectButton"]').forEach(element => {
                                    if(element.dataset.key == this.cardId) {
                                        element.label = "Selected";
                                        element.variant = "success";
                                    }
                                    else {
                                        element.label = "Select";
                                        element.variant = "neutral";
                                    }
                                });
                            })
                            .catch((error) =>{
                                console.log(error);
                            })
                        })
                        .catch((error) =>{
                            console.log(error);
                        })
                    }
                    else {
                        return JSON.parse(response[1]);
                    }
                })
                .then((res) => {
                    //Check if card is not valid. If not valid then show error
                    if(!this.validCard) {
                        const cardError = res;
                        this.errorCode;
                        if(res.error.decline_code == undefined) {
                            this.errorCode = res.error.code;
                        }
                        else {
                            this.errorCode = res.error.decline_code;
                        }
                        const evt = new ShowToastEvent({
                            title: "Unable to add card: " + this.errorCode,
                            message: res.error.message,
                            variant: "error",
                            mode: "sticky"
                        });
                        this.dispatchEvent(evt);
                    };
                })
                .catch((error) =>{
                    console.log(error);
                })
            })
            .catch((error) =>{
                console.log(error);
            })
        }
        //else show error
        else {
            var inputCmp = this.template.querySelector('.inputYear2');
            var value = inputCmp.value;
            // is input valid text?
            if (parseInt(value) < 2023) {
                inputCmp.setCustomValidity('Expiration year must be a numeric value and 2023 or later');
            } else {
                inputCmp.setCustomValidity(''); // if there was a custom error before, reset it
            }
            inputCmp.reportValidity();
            const evt = new ShowToastEvent({
                title: "Error!",
                message: "Must fill all required fields.",
                variant: "error",
                mode: "dismissible"
            });
            this.dispatchEvent(evt);
        }
    }

    //Save card and add it to customer through Stripe API
    addFirstCard() {
        //If all form fields are filled in and are valid
        if(this.cardFormValidation) {
            //create token and then convert token into a payment method on the customer
            createToken({
                accountId: this.accountId,
                cardNumber: this.cardNum, 
                expMonth: this.expMonth, 
                expYear: this.expYear, 
                cvc: this.cvc})
            .then((response) => {
                console.log(response);
                this.tokenId = response;
                this.validCard = false;
                addCard({
                    customerId: this.customerId,
                    token: this.tokenId
                })
                .then((response) => {
                    console.log(response);
                    if(response[0] == "200") {
                        this.validCard = true;
                        this.cardId = response[1];
                        viewAllCards({
                            customerId: this.customerId
                        })
                        .then((response) => {
                            return JSON.parse(response);
                        })
                        .then((res) => {
                            this.cards = res.data
                                .map(row => ({ ...row, last4: "•••• •••• •••• "+row.last4, }));
                            if(this.cards.length > 0) {
                                this.curCard = this.cards[0];
                            }
                        })
                        .catch((error) =>{
                            console.log(error);
                        })
                    }
                    else {
                        return JSON.parse(response[1]);
                    }
                })
                .then((res) => {
                    //Check if card is not valid. If not valid then show error
                    if(!this.validCard) {
                        const cardError = res;
                        this.errorCode;
                        if(res.error.decline_code == undefined) {
                            this.errorCode = res.error.code;
                        }
                        else {
                            this.errorCode = res.error.decline_code;
                        }
                        const evt = new ShowToastEvent({
                            title: "Unable to add card: " + this.errorCode,
                            message: res.error.message,
                            variant: "error",
                            mode: "sticky"
                        });
                        this.dispatchEvent(evt);
                    };
                })
                .catch((error) =>{
                    console.log(error);
                })
            })
            .catch((error) =>{
                console.log(error);
            })
        }
        //else show error
        else {
            const evt = new ShowToastEvent({
                title: "Error!",
                message: "Must fill all required fields.",
                variant: "error",
                mode: "dismissible"
            });
            this.dispatchEvent(evt);
        }
    }

    //Creates invoice and attempts payment
    pay() {
        this.loading = true;
        this.closeModal3();
        createInvoice({
            accId: this.accountId,
            contactId: this.contactId,
            customerId: this.customerId,
            source: this.curCard.id
        })
        .then((response) => {
            console.log(response);
            this.invoiceId = response;
            getInvoice({ invoiceId: this.invoiceId})
            .then((response)=> {
                return JSON.parse(response);
            })
            .then((res) => {
                this.invoice = res;
                if(this.invoice.paid == true) {
                    updateRemainingAmount({
                        accountId: this.accountId,
                        newVal: 0
                    })
                    .then((response) => {
                        refreshApex(this.account);
                        console.log(this.balanceDue);
                        this.loading=false;
                    })
                    .catch((error) =>{
                        console.log(error);
                    })
                    const evt = new ShowToastEvent({
                        title: "Payment Successful!",
                        message: "Payment has been successfully made.",
                        variant: "success",
                        mode: "dismissible"
                    });
                    this.dispatchEvent(evt);
                }
                //if payment not successful, show error
                else {
                    const evt = new ShowToastEvent({
                        title: "Payment failed: " + this.invoice.last_finalization_error.code,
                        message: this.invoice.last_finalization_error.message,
                        variant: "error",
                        mode: "sticky"
                    });
                    this.dispatchEvent(evt);
                    this.loading=false;
                }
            })
        })
        .catch((error) =>{
            console.log(error);
        })
    }

    //Add flag to account for auto payments
    enableAuto() {
        setAutoPayments({ accountId: this.accountId, setting: true })
        .then((response) => {
            this.autoPaymentEnabled = true;
            this.closeModal2();
        })
        .catch((error) =>{
            console.log(error);
        })
    }

    //Remove aut payments flag from account
    disableAuto() {
        setAutoPayments({ accountId: this.accountId, setting: false })
        .then((response) => {
            this.autoPaymentEnabled = false;
            this.closeModal2();
        })
        .catch((error) =>{
            console.log(error);
        })
    }

    //Delete card item
    deleteCardItem() {
        deleteCard({ customerId: this.customerId, cardId: this.currentDelete })
        .then((response) => {
            viewAllCards({
                customerId: this.customerId
            })
            .then((response) => {
                return JSON.parse(response);
            })
            .then((res) => {
                this.cards = res.data
                    .map(row => ({ ...row, last4: "•••• •••• •••• "+row.last4, }));
                if(this.cards.length > 0) {
                    this.curCard = this.cards[0];
                }
                this.closeModal4();
            })
            .catch((error) =>{
                console.log(error);
            })
        })
        .catch((error) =>{
            console.log(error);
        })
    }

    payModal() {
        this.querySelectorHelper('.modalSection3').classList.add('slds-fade-in-open');
        this.querySelectorHelper('.backdropDiv').classList.add('slds-backdrop_open');
    }

    closeModal3() {
        this.querySelectorHelper('.modalSection3').classList.remove('slds-fade-in-open');
        this.querySelectorHelper('.backdropDiv').classList.remove('slds-backdrop_open');
    }

    deleteConfirm(event) {
        this.currentDelete = event.target.dataset.key;
        this.hideModal();
        this.querySelectorHelper('.modalSection4').classList.add('slds-fade-in-open');
        this.querySelectorHelper('.backdropDiv').classList.add('slds-backdrop_open');
    }

    closeModal4() {
        this.querySelectorHelper('.modalSection4').classList.remove('slds-fade-in-open');
        this.querySelectorHelper('.backdropDiv').classList.remove('slds-backdrop_open');
        this.changePayment();
    }

}