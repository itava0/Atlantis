public without sharing class WalkScoreHandler {

    @AuraEnabled(Cacheable=true)
    public static List<Property__c> getProperties(){
        return [SELECT Id, C_Score__c, Has_C_Score__c, Billing_Street__c, Billing_City__c, Geolocation__c FROM Property__c];
    }

    @AuraEnabled(Cacheable=true)
    public static List<Property__c> getProperty(Id propId){
        return [SELECT Id, C_Score__c, Has_C_Score__c, Billing_Street__c, Billing_City__c, Geolocation__c FROM Property__c WHERE Id=:propId];
    }

    @AuraEnabled(Cacheable=true)
    public static List<Integer> getWalk(Id propId){
        Property__c prop = [SELECT Id, Geolocation__Latitude__s, Geolocation__Longitude__s FROM Property__c WHERE Id=:propId];
		Decimal lat = prop.Geolocation__Latitude__s;
		Decimal lon = prop.Geolocation__Longitude__s;
        HttpRequest req = new HttpRequest();
        req.setEndpoint('https://api.walkscore.com/score?format=json&lat='+lat+'&lon='+lon+'&transit=1&bike=1&wsapikey=8229763971e1fa8f5deab51c19b0730d');
        req.setMethod('GET');
        Http http = new Http();
        HTTPResponse res = http.send(req);
        Map<String,Object> result = (Map<String,Object>) JSON.deserializeUntyped(res.getBody());
		List<Integer> scores = new List<Integer>();
		scores.add((Integer) result.get('walkscore'));
		//Map<String,Object> result2 = (Map<String,Object>) JSON.deserializeUntyped((String) result.get('bike'));
		scores.add((Integer) ((Map<String,Object>) result.get('bike')).get('score'));
		return scores;
    }

    @AuraEnabled(Cacheable=false)
    public static void addCScore(Id propId, Integer score){
        Property__c prop = [SELECT Id, C_Score__c FROM Property__c WHERE Id=:propId];
        prop.C_Score__c = score;
        update prop;
    }

}