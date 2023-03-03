public with sharing class LeaseStatusController {
    @AuraEnabled(Cacheable=true)
    public static Contract LeaseStatusController(Id lease) {
        Contract conts=[select id, AccountId, Property__c from Contract where id =:lease];
        return conts;
    }

    @AuraEnabled(Cacheable=false)
    public static void CreateCase(Id accId, String des, Id proId){
        Case caseObj = new Case(
        AccountId = accId,
        Status = 'New',
        Origin = 'Web',
        Priority = 'High',
        Subject = 'cancel',
        PropertyId__c = proId,
        Description = des);
        insert caseObj;   
    }
}