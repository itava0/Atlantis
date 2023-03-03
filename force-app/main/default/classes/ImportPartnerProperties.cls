public class ImportPartnerProperties {
    private static final Map<String, String> stateMap = new Map<String, String>{
        'AL' => 'Alabama',
        'AK' => 'Alaska',
        'AZ' => 'Arizona',
        'AR' => 'Arkansas',
        'CA' => 'California',
        'CO' => 'Colorado',
        'CT' => 'Connecticut',
        'DE' => 'Delaware',
        'FL' => 'Florida',
        'GA' => 'Georgia',
        'HI' => 'Hawaii',
        'ID' => 'Idaho',
        'IL' => 'Illinois',
        'IN' => 'Indiana',
        'IA' => 'Iowa',
        'KS' => 'Kansas',
        'KY' => 'Kentucky',
        'LA' => 'Louisiana',
        'ME' => 'Maine',
        'MD' => 'Maryland',
        'MA' => 'Massachusetts',
        'MI' => 'Michigan',
        'MN' => 'Minnesota',
        'MS' => 'Mississippi',
        'MO' => 'Missouri',
        'MT' => 'Montana',
        'NE' => 'Nebraska',
        'NV' => 'Nevada',
        'NH' => 'New Hampshire',
        'NJ' => 'New Jersey',
        'NM' => 'New Mexico',
        'NY' => 'New York',
        'NC' => 'North Carolina',
        'ND' => 'North Dakota',
        'OH' => 'Ohio',
        'OK' => 'Oklahoma',
        'OR' => 'Oregon',
        'PA' => 'Pennsylvania',
        'RI' => 'Rhode Island',
        'SC' => 'South Carolina',
        'SD' => 'South Dakota',
        'TN' => 'Tennessee',
        'TX' => 'Texas',
        'UT' => 'Utah',
        'VT' => 'Vermont',
        'VA' => 'Virginia',
        'WA' => 'Washington',
        'WV' => 'West Virginia',
        'WI' => 'Wisconsin',
        'WY' => 'Wyoming'
    };
    
    @future(callout=true)	
    public static void importCXPWProperties() {
        HttpRequest req = new HttpRequest();
        req.setEndpoint('https://smoothstack9-dev-ed.develop.my.site.com/cxpw/services/apexrest/api/properties');
        req.setHeader('Content-Type', 'application/json');
        req.setMethod('GET');
        Http http = new Http();
        HTTPResponse res = http.send(req);
        
        System.debug(res.getStatusCode());
        List<Object> data = (List<Object>) JSON.deserializeUntyped(res.getBody());
        System.debug(String.valueOf(res.getBody()));
        List<Property__c> props = [SELECT Id, Name, Status__c, Billing_Street__c,
                                  Billing_City__c, Billing_State__c, Billing_Postal_Code__c, Billing_Country__c,
                                   Origin_Company__c, External_Id__c, Rent__c, Date_Listed__c, Bathrooms__c, 
                                   Bedrooms__c, Picture__c FROM Property__c WHERE Origin_Company__c = 'CXPW'];
        Set<String> externalIds = new Set<String>();
        Map<String,Property__c> propMap = new Map<String,Property__c>();
        for(Property__c prop : props) {
            externalIds.add(prop.External_Id__c);
            propMap.put(prop.External_Id__c, prop);
        }
        for(Object item : data) {
            Map<String,Object> partnerProp = (Map<String,Object>) item;
            Map<String,Object> propAddress = (Map<String,Object>) partnerProp.get('Address__c');
            String recordType;
            String status;
            String country;
            if((String) partnerProp.get('Type__c') == 'Single Family Home') {
                recordType = '012Dn000000gZGqIAM';
            }
            else if(partnerProp.get('Type__c') == 'Townhouse') {
                recordType = '012Dn000000gZGRIA2';
            }
            else if(partnerProp.get('Type__c') == 'Apartment'){
                recordType = '012Dn000000gZGMIA2';
            }
            else {
                recordType = '012Dn000000iXMVIA2';
            }
            if((boolean) partnerProp.get('Rented__c')) {
                status = 'Rented';
            }
            else {
                status = 'Available';
            }
            if(((String) propAddress.get('country')) == 'United States') {
                country = 'United States of America';
            }
            if(!externalIds.contains((String) partnerProp.get('Id'))) {
                propMap.put((String) partnerProp.get('Id'),new Property__c(Name = (String) partnerProp.get('Name'),
                                         Status__c = status,
                                         Billing_Street__c = (String) propAddress.get('street'),
                                         Billing_City__c = (String) propAddress.get('city'),
                                         Billing_State__c = (String) propAddress.get('state'),
                                         Billing_Postal_Code__c = (String) propAddress.get('postalCode'),
                                         Billing_Country__c = country,
                                         Origin_Company__c = 'CXPW',
                                         External_Id__c = (String) partnerProp.get('Id'),
                                         Rent__c = (Decimal) partnerProp.get('Rent__c'),
                                         Date_Listed__c = date.valueof((String) partnerProp.get('Date_Listed__c')),
                                         Bathrooms__c = (Integer) partnerProp.get('Bathrooms__c'),
                                         Bedrooms__c = (Integer) partnerProp.get('Bedrooms__c'),
                                         Picture__c = (String) partnerProp.get('Picture__c'),
                                         RecordTypeId = recordType
                                         ));
            }
            else {
                propMap.get((String) partnerProp.get('Id')).Name = (String) partnerProp.get('Name');
                propMap.get((String) partnerProp.get('Id')).Status__c = status;
                propMap.get((String) partnerProp.get('Id')).Billing_Street__c = (String) propAddress.get('street');
                propMap.get((String) partnerProp.get('Id')).Billing_City__c = (String) propAddress.get('city');
                propMap.get((String) partnerProp.get('Id')).Billing_State__c = (String) propAddress.get('state');
                propMap.get((String) partnerProp.get('Id')).Billing_Postal_Code__c = (String) propAddress.get('postalCode');
                propMap.get((String) partnerProp.get('Id')).Billing_Country__c = country;
                propMap.get((String) partnerProp.get('Id')).Origin_Company__c = 'CXPW';
                propMap.get((String) partnerProp.get('Id')).External_Id__c = (String) partnerProp.get('Id');
                propMap.get((String) partnerProp.get('Id')).Rent__c = (Decimal) partnerProp.get('Rent__c');
                propMap.get((String) partnerProp.get('Id')).Date_Listed__c = date.valueof((String) partnerProp.get('Date_Listed__c'));
                propMap.get((String) partnerProp.get('Id')).Bathrooms__c = (Integer) partnerProp.get('Bathrooms__c');
                propMap.get((String) partnerProp.get('Id')).Bedrooms__c = (Integer) partnerProp.get('Bedrooms__c');
				//propMap.get((String) partnerProp.get('Id')).Picture__c = (String) partnerProp.get('Picture__c');
                propMap.get((String) partnerProp.get('Id')).RecordTypeId = recordType;
            }
        }
        upsert propMap.values();
    }
    
    @future(callout=true)	
    public static void importMoorelandProperties() {
        HttpRequest req = new HttpRequest();
        req.setEndpoint('https://smoothstack35-dev-ed.develop.my.site.com/accountportal/services/apexrest/Property/');
        req.setHeader('Content-Type', 'application/json');
        req.setMethod('GET');
        Http http = new Http();
        HTTPResponse res = http.send(req);
        
        System.debug(res.getStatusCode());
        List<Object> data = (List<Object>) JSON.deserializeUntyped(res.getBody());
        System.debug(String.valueOf(res.getBody()));
        List<Property__c> props = [SELECT Id, Name, Status__c, Billing_Street__c,
                                  Billing_City__c, Billing_State__c, Billing_Postal_Code__c, Billing_Country__c,
                                   Origin_Company__c, External_Id__c, Rent__c, Date_Listed__c, Bathrooms__c, 
                                   Bedrooms__c, Picture__c FROM Property__c WHERE Origin_Company__c = 'Mooreland'];
        Set<String> externalIds = new Set<String>();
        Map<String,Property__c> propMap = new Map<String,Property__c>();
        for(Property__c prop : props) {
            externalIds.add(prop.External_Id__c);
            propMap.put(prop.External_Id__c, prop);
        }
        for(Object item : data) {
            Map<String,Object> partnerProp = (Map<String,Object>) item;
            Map<String,Object> propRecordType = new Map<String,Object>();
            if(partnerProp.get('RecordType') != null) {
                propRecordType = (Map<String,Object>) partnerProp.get('RecordType');
            }
            String recordType;
            String status;
            String country = 'United States of America';
            String state;
            String city;
            if(partnerProp.get('RecordType') != null) {
                if((String) propRecordType.get('Name') == 'Single Family Home') {
                    recordType = '012Dn000000gZGqIAM';
                }
                else if((String) propRecordType.get('Name') == 'Townhouse') {
                    recordType = '012Dn000000gZGRIA2';
                }
                else{
                    recordType = '012Dn000000gZGMIA2';
                }
            }
            else{
                recordType = '012Dn000000gZGMIA2';
            }
            if((String) partnerProp.get('Status__c') == 'Closed') {
                status = 'Rented';
            }
            else {
                status = 'Available';
            }
            if((String) partnerProp.get('State__c') == 'Washington DC'){
                state = 'District of Columbia';
                city = 'Washington DC';
            }
            else {
                state = (String) partnerProp.get('State__c');
                city = (String) partnerProp.get('City__c');
                if(state.length() == 2) {
                    state = stateMap.get(state);
                }
            }
            if(!externalIds.contains((String) partnerProp.get('Id'))) {
                propMap.put((String) partnerProp.get('Id'),new Property__c(Name = (String) partnerProp.get('Name'),
                                         Status__c = status,
                                         Billing_Street__c = (String) partnerProp.get('Address__c'),
                                         Billing_City__c = city,
                                         Billing_State__c = state,
                                         Billing_Postal_Code__c = ((String) partnerProp.get('Zip__c')).substring(0,5),
                                         Billing_Country__c = country,
                                         Origin_Company__c = 'Mooreland',
                                         External_Id__c = (String) partnerProp.get('Id'),
                                         Rent__c = (Decimal) partnerProp.get('Price__c'),
                                         Date_Listed__c = date.valueof((String) partnerProp.get('Date_Listed__c')),
                                         Bathrooms__c = (Integer) partnerProp.get('Baths__c'),
                                         Bedrooms__c = (Integer) partnerProp.get('Beds__c'),
                                         Picture__c = (String) partnerProp.get('Picture__c'),
                                         RecordTypeId = recordType
                                         ));
            }
            
            else {
                propMap.get((String) partnerProp.get('Id')).Name = (String) partnerProp.get('Name');
                propMap.get((String) partnerProp.get('Id')).Status__c = status;
                propMap.get((String) partnerProp.get('Id')).Billing_Street__c = (String) partnerProp.get('Address__c');
                propMap.get((String) partnerProp.get('Id')).Billing_City__c = city;
                propMap.get((String) partnerProp.get('Id')).Billing_State__c = state;
                propMap.get((String) partnerProp.get('Id')).Billing_Postal_Code__c = ((String) partnerProp.get('Zip__c')).substring(0,5);
                propMap.get((String) partnerProp.get('Id')).Billing_Country__c = country;
                propMap.get((String) partnerProp.get('Id')).Origin_Company__c = 'Mooreland';
                propMap.get((String) partnerProp.get('Id')).External_Id__c = (String) partnerProp.get('Id');
                propMap.get((String) partnerProp.get('Id')).Rent__c = (Decimal) partnerProp.get('Price__c');
                propMap.get((String) partnerProp.get('Id')).Date_Listed__c = date.valueof((String) partnerProp.get('Date_Listed__c'));
                propMap.get((String) partnerProp.get('Id')).Bathrooms__c = (Integer) partnerProp.get('Baths__c');
                propMap.get((String) partnerProp.get('Id')).Bedrooms__c = (Integer) partnerProp.get('Beds__c');
				//propMap.get((String) partnerProp.get('Id')).Picture__c = (String) partnerProp.get('Picture__c');
                propMap.get((String) partnerProp.get('Id')).RecordTypeId = recordType;
            }
        }
        upsert propMap.values();
    }
}