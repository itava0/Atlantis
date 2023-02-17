public class AddLeasePayment implements Database.Batchable<sObject> {
    public Database.QueryLocator start(Database.BatchableContext bc) {
       //String query = 'SELECT Id, AccountId, Monthly_Rent__c, StartDate, EndDate, status FROM Contract WHERE EndDate >= TODAY AND StartDate <= TODAY AND status = \'Activated\''; 
       String query = 'SELECT Id, Remaining_Amount__c, AutomaticPayments__c FROM Account WHERE RecordType.Name IN (\'Tenant\', \'Property Owner\')'; 
        return Database.getQueryLocator(query);
    }
    public void execute(Database.BatchableContext bc, List<Account> accountList){
        for(Account acc: accountList) {
            Map<String,Decimal> pricings = StripeHandler.getLeasePricings(acc.Id);
            
        }
        /*Map<Id, Decimal> accPayments = new Map<Id, Decimal>();
        for(Contract con : contractList) {
            if(accPayments.containsKey(con.AccountId)) {
                accPayments.put(con.AccountId, accPayments.get(con.AccountId) + con.Monthly_Rent__c);
            }
            else {
                accPayments.put(con.AccountId, con.Monthly_Rent__c);
            }
        }
        List<Account> accList = [SELECT Id, Remaining_Amount__c FROM Account WHERE Id IN :accPayments.keySet()];
        for(Account acc : accList) {
            acc.Remaining_Amount__c += accPayments.get(acc.Id);
        }
        update accList;*/
    }
    public void finish(Database.BatchableContext bc){
        
    }
}