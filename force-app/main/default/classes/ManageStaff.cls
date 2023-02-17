public without sharing class ManageStaff {
    // Without sharing class to allow property owners to edit staff assignments
    // Done in Apex since community users don't have full access to Accounts, which are parent of Staff junction object
     
    // Create new staff assignment
    @AuraEnabled(cacheable=false)
    public static Staff__c createStaff(Id propId, Id accId) {
        Staff__c stf = new Staff__c(Property__c = propId, Account__c = accId);
        insert stf;
        Staff__c stfAfter = [SELECT Id, Property__c, Account__c, Account__r.Name FROM Staff__c WHERE Id =: stf.Id];
        return stfAfter;
    }
    
    // Reassign an existing staff assignment
    @AuraEnabled(cacheable=false)
    public static Staff__c updateStaff(Id staffId, Id propId) {
        Staff__c stf = [SELECT Id, Property__c FROM Staff__c WHERE Id =: staffId];
        stf.Property__c = propId;
        update stf;
        return stf;
    }
    
    // Delete a staff assignment
    @AuraEnabled(cacheable=false)
    public static void deleteStaff(Id staffId, Id propId) {
        Staff__c stf = [SELECT Id FROM Staff__c WHERE Id =: staffId];
        delete stf;
    }
    
}