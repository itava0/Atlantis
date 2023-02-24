@isTest
public class PropertyDeleteTest {
    @isTest
    public static void PropertyDeleteTest() {
        User usr = [SELECT Id FROM User WHERE Id =: '005Dn000001PW4yIAG'];
        
        // Create test property with rating
        Property__c prop = new Property__c(Name = 'New Property', Billing_Street__c = 'y', Billing_City__c = 'y',
                                           Billing_State__c = 'New Hampshire', Billing_Postal_Code__c = '03272', Billing_Country__c = 'United States of America',
                                           Status__c = 'Available', Geolocation__Latitude__s = 35, Geolocation__Longitude__s = 45);
        insert prop;
        Rating__c rat = new Rating__c(Score__c = '2', Property__c = prop.Id, User__c = usr.Id);
        
        // Test if rating deleted after property deleted
        Test.startTest();
        insert rat;
        update prop;
        delete prop;
        Test.stopTest();
        
        List<Property__c> propAfter = [SELECT Id FROM Property__c];
        List<Rating__c> ratAfter = [SELECT Id FROM Rating__c];

        // Assert property and related ratings were deleted
		System.assertEquals(0, propAfter.size());        
        System.assertEquals(0, ratAfter.size());
	}
}