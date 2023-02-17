import { LightningElement, wire, track } from 'lwc';
import contactRecords from '@salesforce/apex/datatable.getContact'

const columns = [
    { label: 'Contact Name', fieldName: 'Name', type: 'text' },
    { label: 'Contact Phone', fieldName: 'Phone', type: 'phone' },
    { label: 'Contact Email', fieldName: 'Email', type: 'email' },
    { label: 'Contact Level', fieldName: 'Level__c', type: 'picklist' }
];


export default class Datatable extends LightningElement {

    data = [];
    dataAll = [];
    filteredData = [];
    columns = columns;
    name;
    picklist;

    @wire(contactRecords)
    conRecords(records) {    
        console.log(records.data)
        this.data = records.data;
        this.dataAll = this.data;
        if (records.data) {
            this.data = records.data;
        } else {
            console.log('Data error');
        }
    }

    handleNameChange(e) {
        this.name = e.target.value;
    }

    get pickList() {
        return [
            {label: 'Primary', value: 'Primary'},
            {label: 'Secondary', value: 'Secondary'},
            {label: 'Tertiary', value: 'Tertiary'}
        ]
    }

    handlePickChange(e) {
        this.picklist = e.detail.value;
    }

    handleSearch() {
        const result = this.filteredData;
        this.data = result;
        console.log(this.data);
    }

    handleSearchName() {
        this.data = this.dataAll;
        this.filteredData = this.data.filter(data => {
            if( this.name === data.Name) {
                return data 
            }
        });

        this.handleSearch();
    }

    handleSearchLevel() {
        this.data = this.dataAll;
        this.filteredData = this.data.filter(data => {
            if( this.picklist === data.Level__c) {
                return data 
            }
        });

        this.handleSearch();
    }

    handleAll() {
        this.data = this.dataAll;
        console.log(this.data);
    }
}