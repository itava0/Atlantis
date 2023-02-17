trigger AccountTrigger on Account (after insert) {
    Id RecTypeId = Schema.getGlobalDescribe()
        .get('Account')
        .getDescribe()
        .getRecordTypeInfosByName()
        .get('Person Account')
        .getRecordTypeId();
    List<Contact> cons=new List<Contact>();  
    for(Account a: Trigger.New){
        if(a.RecordTypeId != RecTypeId)
        {
            Contact c = new Contact();
            c.accountid=a.id;
            c.lastname=a.name;
            c.phone=a.phone;
            c.email=a.Email__c;
            cons.add(c);
        }
    }

    insert cons;
    /*if(trigger.isAfter && trigger.isInsert) {
    	AccountTriggerHandler.addContact(Trigger.New);
    }*/
}