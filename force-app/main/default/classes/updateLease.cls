public with sharing class updateLease {
    @AuraEnabled(cacheable=false)
    public static void addPet(String pet,Id leaseId) {
        Contract con = [Select Id, Pet__C from Contract where Id =: leaseId];
        con.Pet__c = pet;
        update con;
    }
    @AuraEnabled(cacheable=false)
    public static void addRoommate( Id roommate, Id leaseId) {
        Contract con = [Select Id, Roommate__c from Contract where Id =: leaseId];
        con.Roommate__c = roommate;
        update con;
    }
    @AuraEnabled(cacheable=false)
    public static void addStorage( Boolean storage, Id leaseId) {
        Contract con = [Select Id, Storage__c from Contract where Id =: leaseId];
        con.Storage__c = storage;
        update con;
    }

    @AuraEnabled(cacheable=false)
    public static Id roommate(String firstName, String lastName, Date dateOfbirth, String phone) {
        Contact con = new Contact();
        con.FirstName = firstName;
        con.LastName = lastName;
        con.Birthdate = dateOfbirth;
        con.Phone = phone;
        insert con;
        return con.id;
    }
    
}