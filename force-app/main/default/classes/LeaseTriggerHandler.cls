public class LeaseTriggerHandler {
    @future(callout=true)
    public static void chargeReferralFuture(List<Id> leaseIds) {
        system.debug(leaseIds.size());
        List<Referral__c> referrals = [SELECT Id, email__c FROM Referral__c];
        Set<String> emails = new Set<String>();
        for(Referral__c referral : referrals) {
            emails.add(referral.email__c);
        }
        List<Contract> leases1 = [SELECT Id, Monthly_Rent__c FROM Contract WHERE Id IN: leaseIds];
        System.debug(leases1.size());
        List<Contract> leases = [SELECT Id, Monthly_Rent__c FROM Contract WHERE Id IN: leaseIds AND Account.Email__c IN: emails];
        System.debug(leases.size());
        for(Contract lease : leases) {
            StripeHandler.chargePartnerReferralFee(lease.Monthly_Rent__c*0.1);
        }
    }
    
    public static void chargeReferralUpdate(List<Contract> triggerNew, Map<Id,Contract> triggerOldMap) {
		List<Id> idList = new List<Id>();
        for(Contract item : triggerNew) {
            if(item.Status == 'Activated' && triggerOldMap.get(item.Id).Status != 'Activated') {
                idList.add(item.Id);
            }
        }
        System.debug(triggerNew);
        chargeReferralFuture(idList);
    }
    
    public static void chargeReferralInsert(List<Contract> triggerNew) {
        List<Id> idList = new List<Id>();
        for(Contract item : triggerNew) {
            if(item.Status == 'Activated') {
                idList.add(item.Id);
            }
        }
        chargeReferralFuture(idList);
    }
    
    
}