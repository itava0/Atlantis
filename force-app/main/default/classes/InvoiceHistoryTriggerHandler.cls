public class InvoiceHistoryTriggerHandler {

    //makes creates invoice and submits payment
    @future(callout=true)	
	public static void futurePayment(List<Id> recordIds) {
        system.debug(recordIds);
        List<InvoiceHistory__c> invoices = [SELECT Id, Account__c, InvoiceId__c FROM InvoiceHistory__c WHERE Id IN :recordIds];
        system.debug(invoices);
        List<String> invoiceIds = new List<String>();
        for(InvoiceHistory__c inv : invoices) {
            Id accId = inv.Account__c;
            Contact con = [SELECT Id, AccountId FROM Contact WHERE AccountId =: accId];
            String customerId = StripeHandler.createCustomer(accId);
            String source = StripeHandler.getCustomerDefault(customerId);
            inv.InvoiceId__c = StripeHandler.createInvoice(accId, con.Id, customerId, source);
        }
        update invoices;

    }
    
    //calls the future method
    public static void makePayments(List<InvoiceHistory__c> triggerNew) {
        List<Id> recordIds = new List<Id>();
        for(InvoiceHistory__c inv : triggerNew) {
            recordIds.add(inv.Id);
        }
        system.debug(recordIds);
        futurePayment(recordIds);
    }

}