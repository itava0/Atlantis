import { LightningElement, api } from 'lwc';
import chartJs from '@salesforce/resourceUrl/chartJs';
import { loadScript } from 'lightning/platformResourceLoader';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class PropertyChart extends LightningElement {
    @api chartConfig;
    isChartJsInitialized;

    renderedCallback() {
        if (this.isChartJsInitialized) {
            return;
        }
        Promise.all([loadScript(this, chartJs)])
        .then(() => {
            this.isChartJsInitialized = true;
            const ctx = this.template.querySelector('canvas.barChart').getContext('2d');
            this.chart = new window.Chart(ctx, JSON.parse(JSON.stringify(this.chartConfig)));
        })
        .catch(error => {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error Loading Chart',
                    message: error.message,
                    variant: 'error'
                })
            );
        });
    }
}