public with sharing class getAddresses {
	@AuraEnabled(cacheable=true)
    public static List<Address__c> getAddressInfo() {
		return [SELECT Id, Latitude__c, Longitude__c, Street__c, City__c, State__c, PostalCode__c, CreatedDate FROM Address__c ORDER BY CreatedDate DESC LIMIT 5];        
    }
}