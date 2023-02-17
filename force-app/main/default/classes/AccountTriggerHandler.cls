public class AccountTriggerHandler {
    public static void addContact(List<Account> triggerNew) {
        List<Contact> cons=new List<Contact>();  
        for(Account a: triggerNew){
            Contact c = new Contact();
            c.accountid=a.id;
            c.lastname=a.name;
            c.phone=a.phone;
            c.email=a.Email__c;
            cons.add(c);
        }
    
        insert cons;
    }
}