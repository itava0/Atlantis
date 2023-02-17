@isTest
public class PropertyDeleteTest {
    @isTest
    public static void PropertyDeleteTest() {
        User usr = [SELECT Id FROM User WHERE Id =: '005Dn000001PW4yIAG'];
        Account accTen = new Account(Name = 'Tenant', RecordTypeId = '012Dn000000gfNnIAI');
        Account accOwn = new Account(Name = 'Property Owner', RecordTypeId = '012Dn000000giXgIAI');
        insert accTen;
        insert accOwn;
        
        Property__c prop = new Property__c(Name = 'New Property', Billing_Street__c = 'y', Billing_City__c = 'y',
                                           Billing_State__c = 'New Hampshire', Billing_Postal_Code__c = '03272', Billing_Country__c = 'United States of America',
                                           Status__c = 'Available', Geolocation__Latitude__s = 35, Geolocation__Longitude__s = 45);
        insert prop;
        Rating__c rat = new Rating__c(Score__c = '2', Property__c = prop.Id, User__c = usr.Id);
        School__c sch = new School__c(Name = 'Test School', Property__c = prop.Id);
        Property_Owner__c own = new Property_Owner__c(Property__c = prop.Id, Account__c = accOwn.Id);
        Tenant__c ten = new Tenant__c(Property__c = prop.Id, Account__c = accTen.Id);
        
        Test.startTest();
        insert rat;
        insert sch;
        insert own;
        insert ten;
        update prop;
        delete prop;
        Test.stopTest();
        
        List<Property__c> propAfter = [SELECT Id FROM Property__c];
        List<Rating__c> ratAfter = [SELECT Id FROM Rating__c];
        List<School__c> schAfter = [SELECT Id FROM School__c];
        List<Property_Owner__c> ownAfter = [SELECT Id FROM Property_Owner__c];
        List<Tenant__c> tenAfter = [SELECT Id FROM Tenant__c];

        // Assert property and related records were deleted
		System.assertEquals(0, propAfter.size());        
        System.assertEquals(0, ratAfter.size());
        System.assertEquals(0, schAfter.size());
        System.assertEquals(0, ownAfter.size());
        System.assertEquals(0, tenAfter.size());
	}
}