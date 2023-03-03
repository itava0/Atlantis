public class AddLeasePayment implements Database.Batchable<sObject> {
    public Database.QueryLocator start(Database.BatchableContext bc) {
       String query = 'SELECT Id, AccountId, Monthly_Rent__c, StartDate, EndDate, status FROM Contract WHERE EndDate >= TODAY AND StartDate <= TODAY AND status = \'Activated\''; 
       //String query = 'SELECT Id, Remaining_Amount__c, AutomaticPayments__c FROM Account WHERE RecordType.Name IN (\'Tenant\', \'Property Owner\')'; 
        return Database.getQueryLocator(query);
    }
    public void execute(Database.BatchableContext bc, List<Contract> contractList){
        /*for(Account acc: accountList) {
            if(acc.AutomaticPayments__c) {
                Decimal pricings = StripeHandler.getLeasePricings(acc.Id).get('Overall');
            }
        }*/
        Map<Id, Decimal> accPayments = new Map<Id, Decimal>();
        for(Contract con : contractList) {
            Decimal pricing = StripeHandler.getLeasePricings(con.AccountId).get('Overall');
            if(accPayments.containsKey(con.AccountId)) {
                accPayments.put(con.AccountId, accPayments.get(con.AccountId) + pricing);
            }
            else {
                accPayments.put(con.AccountId, pricing);
            }
        }
        List<Account> accList = [SELECT Id, Remaining_Amount__c FROM Account WHERE Id IN :accPayments.keySet()];
        for(Account acc : accList) {
            acc.Remaining_Amount__c += accPayments.get(acc.Id);
        }
        update accList;
    }
    public void finish(Database.BatchableContext bc){
        
    }
}