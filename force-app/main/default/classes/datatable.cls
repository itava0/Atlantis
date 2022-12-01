public with sharing class datatable {
    @AuraEnabled(Cacheable=true)
    public static List<Contact> getContact() {
        return [SELECT Name, Phone, Email, Level__c FROM Contact LIMIT 50];
    }
}