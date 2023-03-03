trigger LeaseTrigger on Contract (before insert, before update, after insert, after update) {
    if(Trigger.isBefore && (Trigger.isInsert || Trigger.isUpdate)) {
        for(Contract con: Trigger.new){
            if(con.Deposit_Required__c && con.Deposit_Price__c == NULL) {
                con.Deposit_Price__c = con.Monthly_Rent__c/2;
            }
            else if((!con.Deposit_Required__c) && con.Deposit_Price__c == NULL){
                con.Deposit_Price__c = 0;
            }
        }
    }
    if(Trigger.isAfter && Trigger.isInsert) {
        LeaseTriggerHandler.chargeReferralInsert(Trigger.new);
    }
    if(Trigger.isAfter && Trigger.isUpdate) {
        LeaseTriggerHandler.chargeReferralUpdate(Trigger.new, Trigger.oldMap);
    }
}