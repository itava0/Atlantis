public class ImportPartnerProperties {
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
        List<Property__c> props = new List<Property__c>();
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
            else{
                recordType = '012Dn000000gZGMIA2';
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
            props.add(new Property__c(Name = (String) partnerProp.get('Name'),
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
                                     Picture__c = (String) partnerProp.get('Picture__c')
                                     ));
        }
        insert props;
    }
    
    /*
    public static String getToken() {
        HttpRequest req = new HttpRequest();
        req.setEndpoint('https://login.salesforce.com/services/oauth2/token?grant_type=password&client_id=3MVG9ux34Ig8G5ep6bq0BLsyy1AiGOjBmqemDXyr2.QbeJ5LAcSywAyC6JYc8kXT.k8D8POzOcwR98aOSizyh&client_secret=654B1663112004CD7F5A3215FB4795733D789FFBE02CF517F32ABC765B44670E&username=atlantispropertiescompany@gmail.com&password=u262bB5d%24%25iS');
        req.setHeader('Content-Type', 'application/json');
        req.setMethod('POST');
        req.setBody('"resources" : ["*"]');
        Http http = new Http();
        HTTPResponse res = http.send(req);
        
        System.debug(res.getStatusCode());
        Map<String, Object> token_data = (Map<String, Object>) JSON.deserializeUntyped(res.getBody());
        System.debug(String.valueOf(res.getBody()));
        String token = (String) token_data.get('access_token');
        return token;
    }
*/
}