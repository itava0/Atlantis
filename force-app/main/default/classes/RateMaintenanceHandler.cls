public without sharing class RateMaintenanceHandler {
    //Query all requests correlated with specified contact id
    @AuraEnabled(Cacheable=true)
    public static List<Case> getRequests(Id conId) {
        return [SELECT Id, CaseNumber, PropertyId__r.Billing_Street__c, CreatedDate, ClosedDate, Subject, Description FROM Case WHERE ContactId=:conId AND PropertyId__c != Null AND Subject != 'cancel' ORDER BY ClosedDate DESC NULLS LAST];
    }

    //Query request and update
    @AuraEnabled(Cacheable=false)
    public static void updateRequest(Id caseId, Integer newTimeliness, Integer newProfessionalism, Integer newQuality, Integer newOverall) {
        Case curCase = [SELECT Id, Timeliness__c, Professionalism__c, Quality__c, Overall__c FROM Case WHERE Id=:caseId];
        curCase.Timeliness__c = newTimeliness;
        curCase.Professionalism__c = newProfessionalism;
        curCase.Quality__c = newQuality;
        curCase.Overall__c = newOverall;
        update curCase;
    }
}