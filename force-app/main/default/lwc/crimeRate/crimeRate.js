import { LightningElement , wire , track} from 'lwc';
import getProperties from '@salesforce/apex/CrimeRateHandler.getProperties';

const GA_AGENCIES = 'https://api.usa.gov/crime/fbi/sapi/api/agencies/byStateAbbr/raw/'
const GA_CRIMES_BY_AGENCY = 'https://api.usa.gov/crime/fbi/sapi/api/summarized/agencies/' //{ori}/offenses/2020/2020
const CRIME_API_KEY = '?API_KEY=qMWe7V4kjpW3UqO5c1dKXp3NBAtkxqnHEvlHbFlR'

const GEO = 'https://geo.fcc.gov/api/census/area'

const CENSUS = 'https://api.census.gov/data/2019/pep/population?get=NAME,POP'
const CENSUS_KEY = '&key=fe0fa2a8c21043b78b66bf53664a0d9858f5ed45'

//const CENSUS = 'https://api.census.gov/data/2019/pep/charagegroups?get=NAME,POP&for=county:*&key=fe0fa2a8c21043b78b66bf53664a0d9858f5ed45'



export default class CrimeRate extends LightningElement {

    curAgency;
    agencyData;
    atlantaCounties = ['CHEROKEE', 'CLAYTON', 'COBB', 'DEKALB', 'DOUGLASS', 'FAYETTE', 'FORSYTH', 'FULTON',
        'GWINNETT', 'HENRY', 'ROCKDALE'];
    zip;
    properties =[];
    property;
    state;
    stateCode;
    propertyIndex;
    list = [];
    countyFIPS;
    countyName;
    stateFIPS;
    oriList = [];
    numCrimes=0;
    numPop;
    c_score;
    @track item;


    @wire(getProperties)
    getAtlantaProperties(records) {
        //console.log(records);
        if(records.data) {
            //console.log("If Data");
            // console.log(records);
            // console.log(records.data);
            this.properties = records.data;
            //console.log(this.properties);
            //console.log(this.accountId());
        }
        else {
            console.log("Get account properties error");
        }
    }

    renderedCallback() {

    }

    get agencies() {
        return GA_AGENCIES+this.stateCode+CRIME_API_KEY;
    }

    get crimesByAgency() {
        return GA_CRIMES_BY_AGENCY+this.curAgency+'/offenses/2019/2019'+CRIME_API_KEY;
    }

    

    get geoInfo() {
        //console.log(this.properties.Geolocation__c);
        return GEO+'?lat='+String(this.property.Geolocation__c.latitude)+'&lon='+String(this.property.Geolocation__c.longitude)+'&censusYear=2020&format=json';
    }

    get censusData() {
        return CENSUS+'&for=COUNTY:'+String(this.countyFIPS)+'&in=STATE:'+String(this.stateFIPS)+CENSUS_KEY;
    }

    get pickList() {
        // console.log(this.properties);
        // console.log("Entering picklist")
        this.list = [];
        //console.log("here");
        for(let i = 0; i < this.properties.length; i += 1) {
            //console.log("In loop", i);
            // console.log(this.properties[i]);
            // console.log(this.list);
            this.list = [...this.list, {
                label: String(this.properties[i].Billing_Street__c),
                value: String(i)
            }];
            // console.log(this.list);
        }
        return this.list;
    }

    pickListChange(e) {
        this.propertyIndex = e.detail.value;
        this.property = this.properties[parseInt(this.propertyIndex)];
        console.log(this.property);
    }

    onclickHandler() {
        fetch(this.geoInfo)
        .then(response=>{
            if(response.ok){
                return response.json();
            }
            throw Error(response);
        })
        .then(res=>{
            //console.log(res);
            console.log(res.results[0].county_name);
            this.countyName = res.results[0].county_name.slice(0,-7);
            this.countyFIPS = String(res.results[0].county_fips).substring(2);
            this.stateFIPS = String(res.results[0].county_fips).substring(0,2);
            this.stateCode = res.results[0].state_code;
            //console.log(this.countyFIPS, this.stateFIPS);

            // console.log(this.GA_Data['GA0010000']);
            fetch(this.agencies)
            .then(response=>{
                if(response.ok){
                    return response.json();
                }
                throw Error(response)
            })
            .then(res=>{
                //console.log(res);
                //console.log(this.stateCode);
                this.oriList = [];
                for (var key in res) {
                    //console.log("Key: " + key);
                    for(var key2 in res[key]) {
                        console.log(res[key][key2]["county_name"].toUpperCase());
                        if(res[key][key2]["county_name"].toUpperCase()=== this.countyName.toUpperCase() &&
                        res[key][key2]["state_abbr"].toUpperCase()=== this.stateCode.toUpperCase()){
                            this.oriList = [...this.oriList, String(res[key][key2]["ori"])];
                            console.log(res[key][key2]["county_name"].toUpperCase(), this.countyName.toUpperCase());
                        }
                    }
                }
                this.numCrimes = 0;
                var promises = [];
                for(var i = 0; i < this.oriList.length; i += 1) {
                    this.curAgency = this.oriList[i];
                    console.log(this.crimesByAgency);
                    promises.push(
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
                                this.numCrimes += res["results"][i]["actual"];
                            }
                        })
                        .catch((error)=>
                            console.log("Ori error"))
                    );
                }
                //console.log(this.censusData);
                promises.push(
                    
                    fetch(this.censusData)
                    .then(response=>{
                        if(response.ok){
                            return response.json();
                        }
                        throw Error(response)
                    })
                    .then(res => {
                        //console.log(res);
                        this.numPop = parseInt(res[1][1]);
                    })
                    .catch((error)=>
                        console.log("Pop error"))
                )
                Promise.all(promises).then(() => {
                    console.log(this.numCrimes);
                    console.log(this.numPop);
                    console.log((this.numCrimes/this.numPop)*100);
                    let x =100-((this.numCrimes/this.numPop)*100);
                    this.c_score = (x*x)/100;
                    console.log("Crime Index:", this.c_score)
                })
                .catch((error)=>
                    console.log("Promises error"))

            })
            .catch((error)=>
                console.log("Agencies error"))
        })
        .catch((error)=>
            console.log("Geo error"))
    }
    
}