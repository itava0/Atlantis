public without sharing class CustomerLeaseHistoryHandler {
    @AuraEnabled(Cacheable=true)
    public static List<Contract> getLeases(Id accountId) {
        List<Contract> leaseList = [SELECT Id, ContractNumber, StartDate, EndDate FROM Contract WHERE AccountId =: accountId];
        return leaseList;
    }
}