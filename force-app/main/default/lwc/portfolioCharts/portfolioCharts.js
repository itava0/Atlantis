import { LightningElement, api } from 'lwc';

export default class PortfolioCharts extends LightningElement {
    @api userId;
    @api singleProperty;
    @api numProperties;
    @api userFirstName;
}