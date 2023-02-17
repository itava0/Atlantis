@isTest
public class RatingUpdateInsertTest {
    @isTest
    public static void RatingUpdatedInsertedTest() {
        Property__c prop1 = new Property__c(Name = 'New Property', Billing_Street__c = 'x', Billing_City__c = 'x',
                                           Billing_State__c = 'Vermont', Billing_Postal_Code__c = '05603', Billing_Country__c = 'United States of America',
                                           Status__c = 'Available', Geolocation__Latitude__s = 30, Geolocation__Longitude__s = 40);
        User usr1 = [SELECT Id FROM User WHERE Id =: '005Dn000001PW4yIAG'];
        User usr2 = [SELECT Id FROM User WHERE Id =: '005Dn000001PW51IAG'];
        User usr3 = [SELECT Id FROM User WHERE Id =: '005Dn000002NsBIIA0'];
        
        Boolean exceptionThrown = false;
        
        // Inserting properties and ratings
        Test.startTest();
        insert prop1;
        Rating__c rat1 = new Rating__c(Score__c = '3', Property__c = prop1.Id, User__c = usr1.Id);
        Rating__c rat2 = new Rating__c(Score__c = '4', Property__c = prop1.Id, User__c = usr2.Id);
        Rating__c rat3 = new Rating__C(Score__c = '5', Property__c = prop1.Id, User__c = usr3.Id);
        insert rat1;
        insert rat2;
        insert rat3;
        
        // Property 1: Three ratings, and an attempt at a 4th which is a duplicate property/user combination
        update prop1;
        try {
            Rating__c rat4 = new Rating__c(Score__c = '3', Property__c = prop1.Id, User__c = usr1.Id);
            insert rat4;
            update prop1;
        } catch (Exception e) {
            exceptionThrown = true;
        }
        update prop1;
        
        // Get Updated Properties
        Property__c prop1New = [SELECT Id, Name, Score__c, Rating_Count__c FROM Property__c WHERE Name = 'New Property'];
        
        // Assert exception was thrown in case of account making more than one rating per property
        System.assertEquals(true, exceptionThrown);
        // Assert property scores match expected values, after various inserts and updates
        System.assertEquals(4.0, prop1New.Score__c);
        // Assert property has correct number of ratings
        System.assertEquals(3, prop1New.Rating_Count__c);
	}
}