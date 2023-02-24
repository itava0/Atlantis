trigger InvoiceHistoryTrigger on InvoiceHistory__c (after insert) {
    if(Trigger.isAfter && Trigger.isInsert) {
        InvoiceHistoryTriggerHandler.makePayments(Trigger.new);
    }
}