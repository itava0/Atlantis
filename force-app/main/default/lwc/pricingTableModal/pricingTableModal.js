import { LightningElement, api } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import createPropertyOwner from '@salesforce/apex/PricingTableHandler.createPropertyOwner'
import createToken from '@salesforce/apex/StripeHandler.createToken'

export default class PricingTableModal extends LightningElement {
    @api modalClass = "slds-modal slds-fade-in-open slds-modal_small";
    @api showmodal = false;
    paymentPlan = "";
    cardNum;
    expMonth;
    expYear;
    cvc;
    tokenId;
    validCard = false;
    fName;
    lName;
    email;
    newPhone;
    nickName;

    @api getPlan(newPlan) {
        this.paymentPlan = newPlan;
        console.log("inserted ",newPlan, " ", this.paymentPlan);
    }

    closemodal(event) {
        let ev = new CustomEvent('childmethod');
        this.dispatchEvent(ev);
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

    fNameHandler(event) {
        this.fName = event.target.value;
    }

    lNameHandler(event) {
        this.lName = event.target.value;
    }

    emailHandler(event) {
        this.email = event.target.value;
    }

    nicknameHandler(event) {
        this.nickname = event.target.value;
    }

    newPhoneHandler(event) {
        this.newPhone = event.target.value;
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

    submitCard(event) {
        if(this.cardFormValidation) {
            //create token and then convert token into a payment method on the customer
            createToken({
                cardNumber: this.cardNum, 
                expMonth: this.expMonth, 
                expYear: this.expYear, 
                cvc: this.cvc})
            .then((response) => {
                console.log(response);
                this.tokenId = response;
                this.validCard = true;
            })
            .catch((error) =>{
                console.log(error);
            })
        }
        //else show error
        else {
            var inputCmp = this.template.querySelector('.inputYear');
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

    submitForm(event) {
        createPropertyOwner( { fName: this.fName, 
            lName: this.lName,
            email: this.email, 
            newPhone: this.newPhone, 
            nickName: this.nickName,
            paymentPlan: this.paymentPlan
        })
        .then()
        .catch((error) => {
            console.log("Unable to create user");
            console.log(error);
        })
        
    }

    
}