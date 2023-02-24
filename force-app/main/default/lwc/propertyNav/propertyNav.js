import { LightningElement, wire } from 'lwc';
import { publish, MessageContext } from "lightning/messageService";
import MAPGRIDSWAPMC from "@salesforce/messageChannel/MapGridSwap__c";

const DELAY = 350;

export default class PropertyNav extends LightningElement {

    showTileList = true;
    showListMap = false;

    @wire(MessageContext)
    messageContext;

    // Hide property map and show property grid
    handleTileList() {
        if (this.showListMap == true) {
            this.showListMap = false;
        }
        this.showTileList = true;
        this.fireChangeEvent();
    }

    // Hide property grid and show property map
    handleListMap() {
        if (this.showTileList == true) {
            this.showTileList = false;
        }
        this.showListMap = true;
        this.fireChangeEvent();
    }

    // Send message to filters to update if user switches between grid and map
    fireChangeEvent() {
        // Debouncing this method: Do not actually fire the event as long as this function is
        // being called within a delay of DELAY. This is to avoid a very large number of Apex
        // method calls in components listening to this event.
        window.clearTimeout(this.delayTimeout);
    
        // Sends variables, primarily for filters, through message channel
        this.delayTimeout = setTimeout(() => {
            const fields = {
                swapped: true
            };
            publish(this.messageContext, MAPGRIDSWAPMC, fields);
        }, DELAY);
    }
}