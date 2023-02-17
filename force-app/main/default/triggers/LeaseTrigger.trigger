trigger LeaseTrigger on Contract (before insert, before update) {
    for(Contract con: Trigger.new){
        if(con.Deposit_Required__c && con.Deposit_Price__c == NULL) {
            con.Deposit_Price__c = con.Monthly_Rent__c/2;
        }
        else if((!con.Deposit_Required__c) && con.Deposit_Price__c == NULL){
            con.Deposit_Price__c = 0;
        }
    }
}