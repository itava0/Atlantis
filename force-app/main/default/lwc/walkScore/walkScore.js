import { LightningElement, wire , track, api} from 'lwc';
import {
    subscribe,
    unsubscribe,
    MessageContext
} from 'lightning/messageService';
import PROPERTYSELECTEDMC from '@salesforce/messageChannel/PropertySelected__c';
import getProperty from '@salesforce/apex/WalkScoreHandler.getProperty';
import getWalk from '@salesforce/apex/WalkScoreHandler.getWalk'
import addCScore from '@salesforce/apex/WalkScoreHandler.addCScore';
const GA_AGENCIES = 'https://api.usa.gov/crime/fbi/sapi/api/agencies/byStateAbbr/raw/'
const GA_CRIMES_BY_AGENCY = 'https://api.usa.gov/crime/fbi/sapi/api/summarized/agencies/'
const CRIME_API_KEY = '?API_KEY=qMWe7V4kjpW3UqO5c1dKXp3NBAtkxqnHEvlHbFlR'

const GEO = 'https://geo.fcc.gov/api/census/area'

const CENSUS = 'https://api.census.gov/data/2019/pep/population?get=NAME,POP'
const CENSUS_KEY = '&key=fe0fa2a8c21043b78b66bf53664a0d9858f5ed45'



export default class WalkScore extends LightningElement {

    properties=[];
    propertyIndex;
    property;
    @api propertyId;
    w_score = 0;
    b_score = 0;
    list = [];
    scores = [];
    isDisabled=false;
    countyFIPS;
    countyName;
    stateFIPS;
    state;
    stateCode;
    oriList = [];
    c_score = 0;
    loadingCount = 0;
    @track item;
    
    @wire(MessageContext)
    messageContext;

    @api
    get recordId() {
        return this.propertyId;
    }

    set recordId(propertyId) {
        this.propertyId = propertyId;
    }
    
    connectedCallback() {
        this.subscription = subscribe(
            this.messageContext,
            PROPERTYSELECTEDMC,
            (message) => {
                this.handlePropertySelected(message);
            }
        );
    }
    
    disconnectedCallback() {
        unsubscribe(this.subscription);
        this.subscription = null;
    }

    handlePropertySelected(message) {
        this.propertyId = message.propertyId;
    }
    
    //Pull crime and population data and calculate the local crime rate
    @wire(getProperty, {propId: '$propertyId'})
    getCScore(records) {
        if(records.data) {
            this.property = records.data[0];
            console.log(this.property);
            
            //Check if data is already saved in record, otherwise pull data from APIs and calculate crime rate
            if(this.property.Has_C_Score__c) {
                this.c_score = this.property.C_Score__c;
                this.template.querySelector("c-walk-score-graph[data-my-id=in3]").handleUpdate(this.c_score);
            }
            else {
                this.loadingCount += 1;
                //first gather data on county, including FIPS code
                fetch(this.geoInfo)
                .then(response=>{
                    if(response.ok){
                        return response.json();
                    }
                    throw Error(response);
                })
                .then(res=>{
                    console.log(res.results[0].county_name);
                    this.countyName = res.results[0].county_name.slice(0,-7);
                    this.countyFIPS = String(res.results[0].county_fips).substring(2);
                    this.stateFIPS = String(res.results[0].county_fips).substring(0,2);
                    this.stateCode = res.results[0].state_code;
                    //pull data on what police agencies are operating in the specified county
                    fetch(this.agencies)
                    .then(response=>{
                        if(response.ok){
                            return response.json();
                        }
                        throw Error(response)
                    })
                    .then(res=>{
                        //saving the ORI code of each relevant police agency
                        this.oriList = [];
                        for (var key in res) {
                            for(var key2 in res[key]) {
                                console.log(res[key][key2]["county_name"].toUpperCase());
                                if(res[key][key2]["county_name"].toUpperCase()=== this.countyName.toUpperCase() &&
                                res[key][key2]["state_abbr"].toUpperCase()=== this.stateCode.toUpperCase()){
                                    this.oriList = [...this.oriList, String(res[key][key2]["ori"])];
                                    console.log(res[key][key2]["county_name"].toUpperCase(), this.countyName.toUpperCase());
                                }
                            }
                        }
                        var numCrimes = 0;
                        var numPop = 0;
                        var promises = [];
                        for(var i = 0; i < this.oriList.length; i += 1) {
                            this.curAgency = this.oriList[i];
                            console.log(this.crimesByAgency);
                            promises.push(
                                //for each agency, count the number of crimes committed
                                fetch(this.crimesByAgency)
                                .then(response=>{
                                    if(response.ok){
                                        return response.json();
                                    }
                                    throw Error(response)
                                })
                                .then(res => {
                                    for( let i = 0; i < res["results"].length; i += 1) {
                                        console.log(res["results"][i]["actual"]);
                                        numCrimes += res["results"][i]["actual"];
                                    }
                                })
                                .catch((error)=>
                                    console.log("Ori error"))
                            );
                        }
                        promises.push(
                            //pull the population info of the specified county
                            fetch(this.censusData)
                            .then(response=>{
                                if(response.ok){
                                    return response.json();
                                }
                                throw Error(response)
                            })
                            .then(res => {
                                numPop = parseInt(res[1][1]);
                            })
                            .catch((error)=>
                                console.log("Pop error"))
                        )
                        //Calculate the crime rate
                        Promise.all(promises).then(() => {
                            let x =100-((numCrimes/numPop)*100);
                            this.c_score = Math.floor((x*x)/100);
                            //this.c_score = 100-((numCrimes/numPop)*100)
                            this.loadingCount -= 1;
                            this.template.querySelector("c-walk-score-graph[data-my-id=in3]").handleUpdate(this.c_score);
                            addCScore({
                                propId: this.propertyId,
                                score: this.c_score
                            })
                            .then((response) => {
                                console.log(response)
                            })
                            .catch((error) =>{
                                console.log(error)
                            })
                        })
                        .catch((error)=>
                            console.log("Promises error"))
                    })
                    .catch((error)=>
                        console.log("Agencies error"))
                })
                .catch((error)=> {
                    console.log("Geo error")})
            }
        }
        else {
            console.log("Get account property error");
        }
    }

    //pull the walk score and bike score data
    @wire(getWalk, {propId: '$propertyId'})
    getWalkScores(records) {
        if(records.data) {
            this.w_score = records.data[0];
            this.b_score = records.data[1];
            this.template.querySelector("c-walk-score-graph[data-my-id=in1]").handleUpdate(this.w_score);
            this.template.querySelector("c-walk-score-graph[data-my-id=in2]").handleUpdate(this.b_score);
        }
        else {
            console.log("Error getting scores")
        }
    }

    get loading() {
        if(this.loadingCount > 0) {
            return true;
        }
        else {
            return false;
        }
    }

    get agencies() {
        return GA_AGENCIES+this.stateCode+CRIME_API_KEY;
    }

    get crimesByAgency() {
        return GA_CRIMES_BY_AGENCY+this.curAgency+'/offenses/2019/2019'+CRIME_API_KEY;
    }

    get geoInfo() {
        console.log(String(this.lat));
        return GEO+'?lat='+String(this.property.Geolocation__c.latitude)+'&lon='+String(this.property.Geolocation__c.longitude)+'&censusYear=2020&format=json';
    }

    get censusData() {
        return CENSUS+'&for=COUNTY:'+String(this.countyFIPS)+'&in=STATE:'+String(this.stateFIPS)+CENSUS_KEY;
    }

}