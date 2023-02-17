public class MonthlyPayments implements Database.Batchable<sObject>, schedulable {
	public void execute (SchedulableContext sc){
		MonthlyPayments batch = new MonthlyPayments();
        Database.executeBatch(batch);
    }
    public Database.QueryLocator start(Database.BatchableContext bc) {
       String query = 'SELECT Id, Remaining_Amount__c, AutomaticPayments__c FROM Account WHERE RecordType.Name IN (\'Tenant\', \'Property Owner\')'; 
       return Database.getQueryLocator(query);
    }
    public void execute(Database.BatchableContext bc, List<Account> accountList){
        List<InvoiceHistory__c> invoiceList = new List<InvoiceHistory__c>();
        for(Account acc:accountList) {
            if(acc.AutomaticPayments__c == true && acc.Remaining_Amount__c != 0) {
                invoiceList.add(new InvoiceHistory__c(Account__c = acc.Id));
                /*
				String customerId = StripeHandler.createCustomer(acc.Id);
                String source = StripeHandler.getCustomerDefault(customerId);
                String invoiceId = StripeHandler.createInvoice(acc.Id, customerId, source);
				*/
            }
        }
        insert invoiceList;
        //update accountList;
    }
    public void finish(Database.BatchableContext bc){
        AddLeasePayment batch = new AddLeasePayment();
        Database.executeBatch(batch);
    }
}