trigger InvoiceHistoryTrigger on InvoiceHistory__c (after insert, after update) {
    if(Trigger.isAfter && Trigger.isInsert) {
        InvoiceHistoryTriggerHandler.makePayments(Trigger.new);
    }
    else if(Trigger.isAfter && Trigger.isUpdate) {
        InvoiceHistoryTriggerHandler.sendEmails(Trigger.new, Trigger.oldMap);
    }
    /*
    for(InvoiceHistory__c inv : Trigger.new) {
        Id accId = inv.Account__c;
        Contact con = [SELECT Id, AccountId FROM Contact WHERE AccountId =: accId];
        String customerId = StripeHandler.createCustomer(accId);
        String source = StripeHandler.getCustomerDefault(customerId);
        String invoiceId = StripeHandler.createInvoice(accId, con.Id, customerId, source);
    }*/
}