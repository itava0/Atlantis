@isTest
public class AccRatingUpdateInsertTest {
    @isTest
    public static void AccRatingUpdatedInsertedTest() {
        Account acc1 = new Account(Name = 'New Account', RecordTypeId = '012Dn000000giXgIAI');
        User usr1 = [SELECT Id FROM User WHERE Id =: '005Dn000001PW4yIAG'];
        User usr2 = [SELECT Id FROM User WHERE Id =: '005Dn000001PW51IAG'];
        User usr3 = [SELECT Id FROM User WHERE Id =: '005Dn000002NsBIIA0'];
        
        Boolean exceptionThrown = false;
        
        // Inserting accounts and ratings
        Test.startTest();
        insert acc1;
        AccRating__c rat1 = new AccRating__c(Score__c = '3', Account__c = acc1.Id, User__c = usr1.Id);
        AccRating__c rat2 = new AccRating__c(Score__c = '4', Account__c = acc1.Id, User__c = usr2.Id);
        AccRating__c rat3 = new AccRating__c(Score__c = '5', Account__c = acc1.Id, User__c = usr3.Id);
        insert rat1;
        insert rat2;
        insert rat3;
        
        // Account 1: Three account ratings, and an attempt at a 4th which is a duplicate account/user combination
        update acc1;
        try {
            AccRating__c rat4 = new AccRating__c(Score__c = '3', Account__c = acc1.Id, User__c = usr1.Id);
            insert rat4;
            update acc1;
        } catch (Exception e) {
            exceptionThrown = true;
        }
        update acc1;
        
        // Get Updated Accounts
        Account acc1New = [SELECT Id, Name, Score__c, Rating_Count__c FROM Account WHERE Name = 'New Account'];
        
        // Assert exception was thrown in case of account making more than one rating per account
        System.assertEquals(true, exceptionThrown);
        // Assert account scores match expected values, after various inserts and updates
        System.assertEquals(4.0, acc1New.Score__c);
        // Assert account has correct number of ratings
        System.assertEquals(3, acc1New.Rating_Count__c);
    }
}