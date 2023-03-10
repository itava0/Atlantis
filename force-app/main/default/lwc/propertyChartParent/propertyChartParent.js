import { LightningElement, wire, api } from 'lwc';
import propertyChart from '@salesforce/apex/getProperties.propertyChart';
import propertyCases from '@salesforce/apex/getProperties.propertyCases';
import propertySpaces from '@salesforce/apex/getProperties.propertySpaces';

const blueColor = 'rgb(54, 162, 235)';
const redColor = 'rgb(255, 99, 132)';
const greenColor = 'rgb(119, 194, 118)';
const colorGroup = ["#0074D9", "#FF4136", "#2ECC40", "#FF851B", "#7FDBFF", "#B10DC9", "#FFDC00", "#001f3f", "#39CCCC", "#01FF70", "#85144b", "#F012BE", "#3D9970", "#111111", "#AAAAAA"];

export default class PropertyChartParent extends LightningElement {
    // Possible chart configurations
    statusConfig;
    rentConfig;
    bedsBathsConfig;
    ratingConfig;
    priceDistributionConfig;
    caseConfig;
    dateListedConfig;
    communalSpaceConfig;
    chartDataset;
    options;
    sortedData = [];
    showChartLabel = 'Show Charts';
    showChartVariant = 'brand';
    showChart = false;

    @api userId;
    @api showChart;
    error;

    // Wire portfolio property information for chart
    @wire(propertyChart, { userId: '$userId' }) propertyChart({ error, data }) {
        if (data) {
            // Initialize datasets
            let rentData = [];
            let bedsData = [];
            let bathsData = [];
            let ratingData = [];
            let statusData = [];
            let dateListedData = [];
            let labels = [];
            let colors = [];
            let availableCount = 0;
            let rentedCount = 0;
            // Sorted
            let sortedRentData = [];
            let sortedRentLabels = [];
            let sortedRatingData = [];
            let sortedRatingLabels = [];
            let sortedDateListedData = [];
            let sortedDateListedLabels = [];
            
            // Populate datasets with values
            data.forEach(prop => {
                if (prop.Status__c == 'Available') availableCount++;
                else if (prop.Status__c == 'Rented') rentedCount++;
                rentData.push(prop.Rent__c);
                bedsData.push(prop.Bedrooms__c);
                bathsData.push(prop.Bathrooms__c);
                statusData.push(prop.Status__c);
                ratingData.push(prop.Score__c);
                dateListedData.push(prop.Date_Listed__c);
                labels.push(prop.Billing_Street__c);
            });

            // Sort data for price distribution chart
            this.sortByRent(data);
            this.sortedData.forEach(prop => {
                sortedRentData.push(prop.Rent__c);
                sortedRentLabels.push(prop.Billing_Street__c);
            });

            // Sort data for rating chart
            this.sortByRating(data);
            this.sortedData.forEach(prop => {
                sortedRatingData.push(prop.Score__c);
                sortedRatingLabels.push(prop.Billing_Street__c);
            });

            // Sort data for date listed chart
            this.sortByDateListed(data);
            this.sortedData.forEach(prop => {
                sortedDateListedData.push(prop.Date_Listed__c);
                sortedDateListedLabels.push(prop.Billing_Street__c);
            });

            // Populate colors from preset color group for certain charts
            for (let i = 0; i < data.length; i++) {
                let j = i;
                if (i > 14) j = Math.floor(Math.random() * (15)) + 1;
                colors.push(colorGroup[j]);
            }

            // Setup configuration of each chart
            this.statusConfig = this.setupChart('doughnut', ['Available', 'Rented'], [greenColor, redColor], ['Status'], [availableCount, rentedCount]);
            this.rentConfig = this.setupChart('bar', labels, [blueColor], ['Rent'], [rentData]);
            this.bedsBathsConfig = this.setupChart('bar', labels, [redColor, greenColor], ['Bedrooms', 'Bathrooms'], [bedsData, bathsData]);
            this.ratingConfig = this.setupChart('bar', sortedRatingLabels, [greenColor], ['Rating'], [sortedRatingData]);
            this.dateListedConfig = this.setupChart('line', sortedDateListedLabels, [blueColor], ['Properties'], [sortedDateListedData]);
            this.priceDistributionConfig = this.setupChart('pie', sortedRentLabels, colors, ['Rent'], sortedRentData);
            this.error = undefined;
        } else if (error) {
            this.error = error;
        }
    }

    // Wire cases
    @wire(propertyCases, { userId: '$userId' }) propertyCases({ error, data }) {
        if (data) {
            let caseData = [];
            let closedCount = 0;
            let openCount = 0;

            data.forEach(cas => {
                caseData.push(cas.Id);
                if (cas.Status == 'Closed') closedCount++;
                else openCount++;
            });

            this.caseConfig = this.setupChart('doughnut', ['Open Cases', 'Closed Cases'], [blueColor, redColor], ['Cases'], [openCount, closedCount]);

        } else if (error) {
            this.error = error;
        }
    }

    // Wire communal spaces
    @wire(propertySpaces, { userId: '$userId' }) propertySpaces({ error, data }) {
        if (data) {
            let communityData = [];
            let spaceData = [];
            let colors = [];

            data.forEach(spc => {
                if (!communityData.includes(spc.Community__r.Name)) {
                    communityData.push(spc.Community__r.Name);
                    spaceData.push(0);
                }
            });

            for (let i = 0; i < communityData.length; i++) {
                data.forEach(spc => {
                    if (spc.Community__r.Name == communityData[i]) spaceData[i]++;
                });
            }

            // Populate colors from preset color group for certain charts
            for (let i = 0; i < data.length; i++) {
                colors.push(colorGroup[i]);
            }

            console.log(communityData);
            console.log(spaceData);

            this.communalSpaceConfig = this.setupChart('pie', communityData, colors, ['Communal Spaces'], spaceData);

        } else if (error) {
            this.error = error;
        }
    }

    // Toggle chart display
    handleShowChart() {
        this.showChart = !this.showChart;
        if (this.showChart) {
            this.showChartLabel = 'Hide Charts';
            this.showChartVariant = 'brand-outline';
        } else {
            this.showChartLabel = 'Show Charts';
            this.showChartVariant = 'brand';
        }
    }

    // Sort data for price distribution chart
    sortByRent(data) {
        this.sortedData = [...data];
        this.sortedData = this.sortedData.sort((a, b) => {
            const rentA = a.Rent__c;
            const rentB = b.Rent__c;
            if (rentA < rentB) return 1;
            if (rentA > rentB) return -1;
            return 0;
        });
    }

    // Sort data for rating chart
    sortByRating(data) {
        this.sortedData = [...data];
        this.sortedData = this.sortedData.sort((a, b) => {
            const ratingA = a.Score__c;
            const ratingB = b.Score__c;
            if (ratingA < ratingB) return -1;
            if (ratingA > ratingB) return 1;
            return 0;
        });
    }

    // Sort data for date listed chart
    sortByDateListed(data) {
        this.sortedData = [...data];
        this.sortedData = this.sortedData.sort((a, b) => {
            const dateListedA = a.Date_Listed__c;
            const dateListedB = b.Date_Listed__c;
            if (dateListedA < dateListedB) return -1;
            if (dateListedA > dateListedB) return 1;
            return 0;
        });
    }

    // Template to setup chart config given parameters, some of them arrays which can be looped through
    // Settings will vary depending on type of chart. Currently supports two types: bar charts, and pie/doughnut charts
    setupChart(type, label, colors, fields, dataset) {
        this.chartDataset = [];
        if (type == 'bar') {
            // Bar chart dataset
            for (let i = 0; i < dataset.length; i++) {
                this.chartDataset.push({
                    label: fields[i],
                    backgroundColor: colors[i],
                    data: dataset[i]
                });
            }
        } else if (type == 'pie' || type == 'doughnut') {
            // Pie/doughnut chart dataset
            this.chartDataset.push({
                data: dataset,
                backgroundColor: colors,
                hoverOffset: 4
            });
        } else if (type == 'line') {
            // Line chart dataset
            let timeData = [];
            for (let i = 0; i < dataset.length; i++) {
                for (let j = 0; j < dataset[i].length; j++) {
                    timeData.push({
                        x: dataset[i][j],
                        y: j + 1
                    })
                }
                this.chartDataset.push({
                    label: fields[i],
                    backgroundColor: colors[i],
                    data: timeData
                });
            }
        }
        
        // Determine options based on type of chart
        this.options = {};
        if (type == 'bar') {
            this.options = {
                scales: {
                    xAxes: [{
                        ticks: {
                            autoSkip: false
                        }
                    }],
                    yAxes: [{
                        display: true,
                        ticks: {
                            beginAtZero: true,
                            precision: 0
                        }
                    }]
                }
            }
        } else if (type == 'line') {
            this.options = {
                scales: {
                    xAxes: [{
                        type: 'time',
                        distribution: 'linear',
                        bounds: 'ticks',
                        ticks: {
                            source: 'data'
                        },
                        time: {
                            unit: 'week',
                            displayFormats: {
                                quarter: 'MMM D'
                            }
                        }
                    }],
                    yAxes: [{
                        display: false,
                        ticks: {
                            precision: 0
                        }
                    }]
                }
            }
        }
        // Return chart configuration
        return {
            type: type,
            data: {
                datasets: this.chartDataset,
                labels: label
            },
            options: this.options
        };
    }
}