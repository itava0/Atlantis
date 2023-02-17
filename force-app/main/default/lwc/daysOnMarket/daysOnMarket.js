import { LightningElement, api, wire } from 'lwc';
import { getRecord, getFieldValue } from 'lightning/uiRecordApi';
import {
    subscribe,
    unsubscribe,
    MessageContext
} from 'lightning/messageService';
import PROPERTYSELECTEDMC from '@salesforce/messageChannel/PropertySelected__c';
import DATE_LISTED_FIELD from '@salesforce/schema/Property__c.Date_Listed__c';
import DAYS_ON_MARKET_FIELD from '@salesforce/schema/Property__c.Days_On_Market__c';

const MAX_DAYS_NORMAL_STATUS = 30;
const MAX_DAYS_WARNING_STATUS = 60;
const MAX_DAYS_CHART = 90;

const FIELDS = [DATE_LISTED_FIELD, DAYS_ON_MARKET_FIELD];

export default class DaysOnMarket extends LightningElement {
    error;
    daysOnMarket;
    dateListed;
    @api propertyId;
    status;
    percent;
    subscription;
    positiveDays = false;

    @wire(MessageContext)
    messageContext;

    // Retrieve current property
    @wire(getRecord, { recordId: '$propertyId', fields: FIELDS })
    wiredRecord({ error, data }) {
        if (data) {
            this.error = undefined;
            this.dateListed = getFieldValue(data, DATE_LISTED_FIELD);
            this.daysOnMarket = getFieldValue(data, DAYS_ON_MARKET_FIELD);
            if (this.daysOnMarket >= 0) {
                this.positiveDays = true;
            }
            // Different color bar depending on number of days
            if (this.daysOnMarket < MAX_DAYS_NORMAL_STATUS) {
                this.status = 'normal';
            } else if (this.daysOnMarket < MAX_DAYS_WARNING_STATUS) {
                this.status = 'warning';
            } else {
                this.status = 'alert';
            }
        } else if (error) {
            this.daysOnMarket = undefined;
            this.dateListed = undefined;
            this.status = undefined;
            this.error = error;
        }
    }

    @api
    get recordId() {
        return this.propertyId;
    }

    set recordId(propertyId) {
        this.propertyId = propertyId;
    }

    get badgeClass() {
        return 'badge ' + this.status;
    }

    get barClass() {
        return 'bar ' + this.status;
    }

    // Styling information
    get barStyle() {
        const value = (this.daysOnMarket / MAX_DAYS_CHART) * 100;
        this.percent = value;
        if (this.percent > 100) {
            this.percent = 100;
        }
        return 'width:' + this.percent + '%';
    }

    // Subscribe to message channel
    connectedCallback() {
        this.subscription = subscribe(
            this.messageContext,
            PROPERTYSELECTEDMC,
            (message) => {
                this.handlePropertySelected(message);
            }
        );
    }

    // Unsubscribe from message channel
    disconnectedCallback() {
        unsubscribe(this.subscription);
        this.subscription = null;
    }

    // Update current property based on message channel
    handlePropertySelected(message) {
        this.propertyId = message.propertyId;
    }
}