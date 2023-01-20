import { LightningElement, api } from 'lwc';
import chartJs from '@salesforce/resourceUrl/chartJs'
import {loadScript} from 'lightning/platformResourceLoader'

export default class WalkScoreGraph extends LightningElement {
    score = 0;
    isLoading = false;
    renderedCallback() {
        console.log('In mortgage chart')
        if(this.isDisabled) {
            return;
        }
        else{
            Promise.all([
                loadScript(this, chartJs)
            ])
            .then(() => {
                console.log('The mortgage Chart JS is OK')
                this.loadData()
            })
            .catch((error) => {
                console.log('Mortgage Chart Error')
            })
            this.isDisabled = true;
        }

    }

    

    loadData() {
        const canvas=document.createElement('canvas')
        this.template.querySelector('div.Chart').appendChild(canvas)
        const ctx = canvas.getContext('2d')
        this.chart= new window.Chart(ctx,this.config())

    }
    

    config() {
        return {
            type: 'doughnut',
            data: {
                datasets: [{
                    data: [this.score, 100-this.score],
                    backgroundColor: [
                        'rgb(54, 162, 235)'
                    ],
                    borderWidth: 0
                }],
                
                // These labels appear in the legend and in the tooltips when hovering different arcs
                labels: [
                    'Score',
                    '--'
                ]
            },
            options: {
                legend: {
                    display: false
                },
                cutoutPercentage: 80,
                showTooltips: false,
                events: [],
                hover: {mode: null},
                rotation: -0.5 * Math.PI
            },
            centerText: {
                display: true,
                text: "280"
            }
            // plugin: [{
            //     id: 'my-doughnut-text-plugin',
            //     afterDraw: function (chart, option) {
            //         let theCenterText = "50%" ;
            //         const canvasBounds = canvas.getBoundingClientRect();
            //         const fontSz = Math.floor( canvasBounds.height * 0.10 ) ;
            //         chart.ctx.textBaseline = 'middle';
            //         chart.ctx.textAlign = 'center';
            //         chart.ctx.font = fontSz+'px Arial';
            //         chart.ctx.fillText(theCenterText, canvasBounds.width/2, canvasBounds.height*0.70 )
            //     }
            // }]
        }
    }

    @api handleUpdate(newScore) {
        if(this.isDisabled) {
            this.isLoading = false;
            // console.log(this.chart.data.datasets);
            // console.log(this.chart.data.datasets[0].data[0]);
            // console.log(this.chart.data.datasets[0].data[1]);
            if(newScore < 50) {
                this.chart.data.datasets[0].backgroundColor[0] = 'rgba(255, 99, 132)';
            }
            else if(newScore < 80) {
                this.chart.data.datasets[0].backgroundColor[0] = 'rgba(255, 206, 86)';
            }
            else {
                this.chart.data.datasets[0].backgroundColor[0] = 'rgba(54, 162, 235)';
            }
            this.chart.data.datasets[0].data[0] = newScore;
            this.chart.data.datasets[0].data[1] = 100 - newScore;
            this.chart.options.rotation = -0.5 * Math.PI;
            this.chart.update();
            console.log("inside if done")
        }
        console.log("update done")
    }
}