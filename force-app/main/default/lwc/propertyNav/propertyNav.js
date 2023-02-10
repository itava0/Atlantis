import { LightningElement } from 'lwc';

export default class PropertyNav extends LightningElement {

    showTileList = true;
    showListMap = false;

    // Hide property map and show property grid
    handleTileList() {
        if (this.showListMap == true) {
            this.showListMap = false;
        }
        this.showTileList = true;
    }

    // Hide property grid and show property map
    handleListMap() {
        if (this.showTileList == true) {
            this.showTileList = false;
        }
        this.showListMap = true;
    }
}