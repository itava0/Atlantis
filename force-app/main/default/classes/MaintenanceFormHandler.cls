public without sharing class MaintenanceFormHandler {
    @AuraEnabled(Cacheable=true)
    public static Contact getContact(Id userId) {
        User newUser = [SELECT Id, ContactId FROM User WHERE Id=:userId LIMIT 1];
        return [SELECT Id, FirstName, Email FROM Contact WHERE Id=:newUser.ContactId];
    }

    @AuraEnabled(Cacheable=true)
    public static List<Property__c> getProperties(Id accountId) {
        List<Tenant__c> tenList = [SELECT Account__c, Property__c FROM Tenant__c WHERE Account__c=:accountId];
        Set<Id> idSet = new Set<Id>();
        for(Tenant__c item:tenList) {
            idSet.add(item.Property__c);
        }
        return [SELECT Id, Billing_Street__c FROM Property__c WHERE Id IN:idSet];
    }

    @AuraEnabled(Cacheable=false)
    public static void createCase(Id newContactId,
                                Id newAccountId, 
                                Id newPropertyId, 
                                String newEmail, 
                                String newName, 
                                String newSubject, 
                                String newDescription,
                                String newType) {
        Case newCase = new Case(ContactId = newContactId,
                            AccountId = newAccountId,
                            PropertyId__c = newPropertyId,
                            Origin = 'Web',
                            Status = 'New',
                            SuppliedEmail = newEmail,
                            SuppliedName = newName,
                            Subject = newSubject,
                            Description = newDescription,
                            Type = newType);
        insert newCase;
    }

}