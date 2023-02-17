import { LightningElement, api, wire} from 'lwc';
import { getRecord, createRecord, deleteRecord } from 'lightning/uiRecordApi';
import { getPicklistValues } from 'lightning/uiObjectInfoApi';
import { getObjectInfo } from 'lightning/uiObjectInfoApi';
import { refreshApex } from '@salesforce/apex';
import getCommunalJunction from '@salesforce/apex/CommunalSpaces.getCommunalJunction';
import getCommunalSpaces from '@salesforce/apex/CommunalSpaces.getCommunalSpaces';
import getOwnerCommunities from '@salesforce/apex/CommunalSpaces.getOwnerCommunities';
import isUserOwner from '@salesforce/apex/CommunalSpaces.isUserOwner';
import updateCommunity from '@salesforce/apex/CommunalSpaces.updateCommunity';
import getMaintenance from '@salesforce/apex/CommunalSpaces.getMaintenance';
//import createCommunalSpace from '@salesforce/apex/CommunalSpaces.createCommunalSpace';

import IN_COMMUNITY from '@salesforce/schema/Property__c.In_Community__c';
import COMMUNITY_ID from '@salesforce/schema/Property__c.Community__c';
import SPACE_TYPE from '@salesforce/schema/Communal_Space__c.Space_Type__c';
import COMMUNAL_SPACE_OBJECT from '@salesforce/schema/Communal_Space__c';
//import NAME_FIELD from '@salesforce/schema/Property_Communal_Space__c';

export default class CommunalSpaceManager extends LightningElement {
    @api recordId;
    error = undefined;
    property = undefined;
    spaceType = undefined;
    spaceTypes = undefined;
    spaceName = undefined;
    isUserOwner = undefined;
    recordTypeId;
    community;
    communityId;
    inCommunity = false;
    communityName;

    //Set up wired properties and methods for retrieving the current property record,
    //associated community, communal spaces, and if the user is an owner of property
    @wire(getRecord, { recordId: '$recordId', fields: [IN_COMMUNITY, COMMUNITY_ID] }) 
    wiredProperty({ error, data }) {
        if (data) {
            console.log("record")
            this.property = data;
            this.inCommunity = data.fields.In_Community__c.value;
            if(this.inCommunity)
                this.communityId = data.fields.Community__c.value;
            this.error = undefined;
            console.log("Community",this.communityId);

            isUserOwner({ propertyId: this.recordId }).then(result => {
                this.isUserOwner = result;
                console.log("Owner: ",result);
            });

            getCommunalJunction({ communityId: this.communityId }).then(result => {
                this.community = result;
                console.log("junction",result);
                this.communityName = result.Name;
            });
        } else if (error) {
            this.error = error;
            this.property = undefined;
        }
    }

    @wire(getCommunalSpaces, { communityId: '$communityId' }) 
    communalSpaces;

    @wire (getPicklistValues, { recordTypeId: '012000000000000AAA', fieldApiName: SPACE_TYPE })
    getSpaceTypes({ error, data }) {
        if (data) {
            this.spaceTypes = data.values;
            //console.log(this.spaceTypes);
            this.error = undefined;
        } else if (error) {
            this.error = error;
            this.spaceTypes = undefined;
        }
    }

    @wire (getObjectInfo, { objectApiName: COMMUNAL_SPACE_OBJECT })
    communalSpaceObjectInfo;

    @wire (getOwnerCommunities)
    ownerCommunities;

    columns = [
        { label: 'Name', fieldName: 'Name' },
        { label: 'Space Type', fieldName: 'Space_Type__c' },
    ];

    connectedCallback() {
        getMaintenance().then(result => {
            console.log('Maintenance',result);
        });
    }

    handleSpaceTypeChange(event) {
        this.spaceType = event.detail.value;
    }

    handleSpaceNameChange(event) {
        this.spaceName = event.detail.value;
    }

    handleCommunityNameChange(event) {
        this.communityName = event.detail.value;
    }

    handleNewCommunity() {
        //Create new community
        const fields = {};
        fields.Name = this.communityName;
        const recordInput = { apiName: 'Property_Communal_Space__c', fields };
        createRecord(recordInput)
            .then(community => {
                console.log("community created");

                //Update property
                updateCommunity({ recordId: this.recordId, communityId: community.id }).then(() => {
                    this.inCommunity = true;

                    // eslint-disable-next-line no-eval
                    eval("$A.get('e.force:refreshView').fire();");
                });
            })
            .catch(error => {
                console.log("error creating community");
                console.log(error);
            });
    }

    //Hande delete communal space
    handleDelete(event) {
        const id = event.target.dataset.id;
        deleteRecord(id)
            .then(() => {
                console.log("communal space deleted");
                refreshApex(this.communalSpaces);
            })
            .catch(error => {
                console.log("error deleting communal space");
                console.log(error);
            });
    }

    //Assign community to property
    handleJoin(event) {
        updateCommunity({ recordId: this.recordId, communityId: event.target.dataset.id }).then(() => {
            this.inCommunity = true;
            this.communityId = event.target.dataset.id;
            this.communityName = event.target.dataset.name;
        });
        //Refresh the record page
        // eslint-disable-next-line no-eval
        eval("$A.get('e.force:refreshView').fire();");
        refreshApex(this.communalSpaces);
        refreshApex(this.community);
        refreshApex(this.property);
    }

    handleNew() {
        //Create new communal space
        const fields = {};
        fields.Name = this.spaceName;
        fields.Space_Type__c = this.spaceType;
        fields.Community__c = this.communityId;
        const recordInput = { apiName: COMMUNAL_SPACE_OBJECT.objectApiName, fields };
        createRecord(recordInput)
            .then(communalSpace => {
                console.log("communal space created");
                console.log(communalSpace);
                this.spaceName = undefined;
                this.spaceType = undefined;
                refreshApex(this.communalSpaces);
            }
        );
    }
}