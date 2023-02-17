public without sharing class CrimeRateHandler {
    @AuraEnabled(Cacheable=true)
    public static List<Property__c> getProperties(){
        return [SELECT Billing_Street__c, Billing_City__c, Geolocation__c FROM Property__c];
    }
}