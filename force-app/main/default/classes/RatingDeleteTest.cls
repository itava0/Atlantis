@isTest
public class RatingDeleteTest {
    @isTest
    public static void RatingDeletedTest() {
        Property__c prop1 = new Property__c(Name = 'New Property', Billing_Street__c = 'y', Billing_City__c = 'y',
                                           Billing_State__c = 'New Hampshire', Billing_Postal_Code__c = '03272', Billing_Country__c = 'United States of America',
                                           Status__c = 'Available', Geolocation__Latitude__s = 35, Geolocation__Longitude__s = 45);
        Property__c prop2 = new Property__c(Name = 'New Property 2', Billing_Street__c = 'z', Billing_City__c = 'z',
                                           Billing_State__c = 'Maine', Billing_Postal_Code__c = '04286', Billing_Country__c = 'United States of America',
                                           Status__c = 'Available', Geolocation__Latitude__s = -35, Geolocation__Longitude__s = -45);
        User usr1 = [SELECT Id FROM User WHERE Id =: '005Dn000001PW4yIAG'];
        User usr2 = [SELECT Id FROM User WHERE Id =: '005Dn000001PW51IAG'];
        User usr3 = [SELECT Id FROM User WHERE Id =: '005Dn000002NsBIIA0'];
        
        // Inserting properties and ratings
        Test.startTest();
        insert prop1;
        insert prop2;
        Rating__c rat1 = new Rating__c(Score__c = '2', Property__c = prop1.Id, User__c = usr1.Id);
        Rating__c rat2 = new Rating__c(Score__c = '1', Property__c = prop1.Id, User__c = usr3.Id);
        Rating__c rat3 = new Rating__C(Score__c = '5', Property__c = prop2.Id, User__c = usr2.Id);
        insert rat1;
        insert rat2;
        insert rat3;
        
        // Property 1: Two ratings, one of which is then deleted
        update prop1;
        rat2.Score__c = '3';
        update rat2;
        delete rat1;
        update prop1;
        
        // Property 2: One rating, which is deleted, leaving 0 remaining ratings
        update prop2;
        delete rat3;
        update prop2;
        Test.stopTest();
        
        // Get Updated Properties
        Property__c prop1New = [SELECT Id, Name, Score__c, Rating_Count__c FROM Property__c WHERE Name = 'New Property'];
        Property__c prop2New = [SELECT Id, Name, Score__c, Rating_Count__c FROM Property__c WHERE Name = 'New Property 2'];
        
        // Assert property scores match expected values, after various inserts, updates, and deletes
        System.assertEquals(3.0, prop1New.Score__c);
        System.assertEquals(0.0, prop2New.Score__c);
        // Assert properties have correct number of ratings
        System.assertEquals(1, prop1New.Rating_Count__c);
        System.assertEquals(0, prop2New.Rating_Count__c);
    }
}