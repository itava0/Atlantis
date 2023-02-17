public class InvoiceHistoryTriggerHandler {

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
            //update invoice
            
            //00XDn000000qHAzMAM
            //Map<String, Object> data = (Map<String, Object>) JSON.deserializeUntyped(StripeHandler.getInvoice('in_1MZfHrD15KhrjJEhCx5rbLio'));
            //System.debug(StripeHandler.getInvoice('in_1MZfHrD15KhrjJEhCx5rbLio'));
            //String pdfLink = (String) data.get('invoice_pdf');
            
            //System.debug(pdfLink);
        }
        update invoices;
        /*
        system.debug(invoiceIds);
        for(String invoiceId : invoiceIds) {
            System.debug(StripeHandler.getInvoice(invoiceId));
            
            //String pdfLink = (String) data.get('invoice_pdf');
            System.debug('PDF LINK');
        }*/
    }
    
	/*@future(callout=true)	
    public static void futureEmail(List<Id> recordIds) {
		List<InvoiceHistory__c> invoices = [SELECT Id, Account__c, InvoiceId__c FROM InvoiceHistory__c WHERE Id IN :recordIds];
        for(InvoiceHistory__c inv : invoices){
            Map<String, Object> data = (Map<String, Object>) JSON.deserializeUntyped(StripeHandler.getInvoice(inv.InvoiceId__c));
            System.debug(StripeHandler.getInvoice(inv.InvoiceId__c));
            String pdfLink = (String) data.get('invoice_pdf');
            
            System.debug(pdfLink);
        }
    }    */

    public static void makePayments(List<InvoiceHistory__c> triggerNew) {
        List<Id> recordIds = new List<Id>();
        for(InvoiceHistory__c inv : triggerNew) {
            recordIds.add(inv.Id);
        }
        system.debug(recordIds);
        futurePayment(recordIds);
    }
    
    public static void sendEmails(List<InvoiceHistory__c> triggerNew,Map<Id,InvoiceHistory__c> triggerOldMap) {
        List<Id> recordIds = new List<Id>();
        for(InvoiceHistory__c inv : triggerNew) {
            if(triggerOldMap.get(inv.Id).InvoiceId__c != inv.InvoiceId__c){
                recordIds.add(inv.Id);
            }
        }
        system.debug(recordIds);
        //futureEmail(recordIds);
    }

}