public without sharing class ManageStaff {
    // Methods are done in a without sharing Apex class, since community users
    // don't have full access to Accounts, which are one of Staff__c's parents
     
    // Create new staff assignment
    @AuraEnabled(cacheable=false)
    public static Staff__c createStaff(Id propId, Id accId, String role) {
        Staff__c stf = new Staff__c(Property__c = propId, Account__c = accId, Role__c = role);
        insert stf;
        return stf;
    }
    
    // Switch role of existing staff assignment
    @AuraEnabled(cacheable=false)
    public static Staff__c roleStaff(Id staffId, String role) {
        Staff__c stf = [SELECT Id, Role__c FROM Staff__c WHERE Id =: staffId];
        stf.Role__c = role;
        update stf;
        return stf;
    }
    
    // Reassign an existing staff assignment
    @AuraEnabled(cacheable=false)
    public static Staff__c updateStaff(Id staffId, Id propId, String role) {
        Staff__c stf = [SELECT Id, Property__c, Role__c FROM Staff__c WHERE Id =: staffId];
        stf.Property__c = propId;
        stf.Role__c = role;
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