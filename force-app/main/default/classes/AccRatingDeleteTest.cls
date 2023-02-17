@isTest
public class AccRatingDeleteTest {
    @isTest
    public static void AccRatingDeletedTest() {
        Account acc1 = new Account(Name = 'New Account', RecordTypeId = '012Dn000000giXgIAI');
        Account acc2 = new Account(Name = 'New Account 2', RecordTypeId = '012Dn000000giXgIAI');
        User usr1 = [SELECT Id FROM User WHERE Id =: '005Dn000001PW4yIAG'];
        User usr2 = [SELECT Id FROM User WHERE Id =: '005Dn000001PW51IAG'];
        User usr3 = [SELECT Id FROM User WHERE Id =: '005Dn000002NsBIIA0'];
        
        // Inserting accounts and ratings
        Test.startTest();
        insert acc1;
        insert acc2;
        AccRating__c rat1 = new AccRating__c(Score__c = '2', Account__c = acc1.Id, User__c = usr1.Id);
        AccRating__c rat2 = new AccRating__c(Score__c = '1', Account__c = acc1.Id, User__c = usr3.Id);
        AccRating__c rat3 = new AccRating__C(Score__c = '5', Account__c = acc2.Id, User__c = usr2.Id);
        insert rat1;
        insert rat2;
        insert rat3;
        
        // Account 1: Two account ratings, one of which is then deleted
        update acc1;
        rat2.Score__c = '3';
        update rat2;
        delete rat1;
        update acc1;
        
        // Account 2: One account rating, which is deleted, leaving 0 remaining account ratings
        update acc2;
        delete rat3;
        update acc2;
        Test.stopTest();
        
        // Get Updated Accounts
        Account acc1New = [SELECT Id, Name, Score__c, Rating_Count__c FROM Account WHERE Name = 'New Account'];
        Account acc2New = [SELECT Id, Name, Score__c, Rating_Count__c FROM Account WHERE Name = 'New Account 2'];
        
        // Assert account scores match expected values, after various inserts, updates, and deletes
        System.assertEquals(3.0, acc1New.Score__c);
        System.assertEquals(0.0, acc2New.Score__c);
        // Assert accounts have correct number of account ratings
        System.assertEquals(1, acc1New.Rating_Count__c);
        System.assertEquals(0, acc2New.Rating_Count__c);
    }
}