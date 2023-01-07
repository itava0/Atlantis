import { LightningElement } from 'lwc';

export default class PropertyNav extends LightningElement {

    showTileList = true;
    showListMap = false;

    handleTileList() {
        if (this.showListMap == true) {
            this.showListMap = false;
        }
        this.showTileList = true;
    }

    handleListMap() {
        if (this.showTileList == true) {
            this.showTileList = false;
        }
        this.showListMap = true;
    }
}