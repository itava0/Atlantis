import { LightningElement, wire , api, track } from 'lwc';
import readText from '@salesforce/apex/MaintenanceShoppingHandler.readText';
import searchItem from '@salesforce/apex/MaintenanceShoppingHandler.searchItem';

export default class MaintenanceShopping extends LightningElement {
    @api recordId;
    textItems;
    @track shoppingItems = [];

    @wire(readText, { caseId: '$recordId'}) 
    textWords(records) {
        console.log(this.recordId);
        console.log(records);
        if(records.data) {
            this.textItems = records.data.map(function(item) { 
                //remove unwanted symbols and replace spaces with underscore
                return item.replace(/([()])/g, '').replace(/ /g,'+');
            });
            console.log(this.textItems);
            for(let i = 0; i < this.textItems.length && i < 3; i += 1) {
                console.log(this.textItems[i]);
                searchItem({ query: this.textItems[i]+"+repair" })
                .then((response) => {
                    console.log(response);
                    var searchResult = response
                        .map(item => ({ ...item, imgLink: item.pagemap.cse_image[0].src, }))
                        .map(item => ({ ...item, htmlTitle: item.htmlTitle.replace("<b>", "").replace("</b>", ""), }));
                    console.log(searchResult);
                    this.shoppingItems = [...this.shoppingItems, searchResult[0]];
                    console.log(this.shoppingItems);
                })
                .catch((error) => {
                    console.log(error);
                });

            }
        }
        else {
            console.log("Get items from text error");
        }
    }

}