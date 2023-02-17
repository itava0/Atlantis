@isTest
public class ManageStaffTest {
    @testSetup static void staffData() {
        // Creating property, account, and staff for use in test methods
        Property__c prop = new Property__c(Name = 'New Property', Billing_Street__c = 'x', Billing_City__c = 'x',
                                           Billing_State__c = 'Vermont', Billing_Postal_Code__c = '05603', Billing_Country__c = 'United States of America',
                                           Status__c = 'Available', Geolocation__Latitude__s = 30, Geolocation__Longitude__s = 40);
        Property__c prop2 = new Property__c(Name = 'New Property 2', Billing_Street__c = 'x', Billing_City__c = 'x',
                                            Billing_State__c = 'Vermont', Billing_Postal_Code__c = '05603', Billing_Country__c = 'United States of America',
                                            Status__c = 'Available', Geolocation__Latitude__s = 30, Geolocation__Longitude__s = 40);
        Account acc = new Account(Name = 'New Account', RecordTypeId = '012Dn000000giXgIAI');
        insert prop;
        insert prop2;
        insert acc;
        Staff__c stf = new Staff__c(Property__c = prop.Id, Account__c = acc.Id);
        insert stf;
    }
    
    @isTest
    public static void createStaffTest() {
        // Test: Insert a new staff record
        Property__c prop3 = new Property__c(Name = 'New Property 3', Billing_Street__c = 'x', Billing_City__c = 'x',
                                            Billing_State__c = 'Vermont', Billing_Postal_Code__c = '05603', Billing_Country__c = 'United States of America',
                                            Status__c = 'Available', Geolocation__Latitude__s = 30, Geolocation__Longitude__s = 40);
        insert prop3;
        Account acc = [SELECT Id FROM Account LIMIT 1];
        Staff__c stf = new Staff__c(Property__c = prop3.Id, Account__c = acc.Id);
        
        Test.startTest();
        insert stf;
        Test.stopTest();
        
        List<Staff__c> stfList = [SELECT Id FROM Staff__c];
        
        // Assert record was created
        System.assertEquals(2, stfList.size());
    }
    
    @isTest
    public static void updateStaffTest() {
        // Test: Update an existing staff record
        Property__c prop = [SELECT Id FROM Property__c WHERE Name = 'New Property' LIMIT 1];
        Property__c prop2 = [SELECT Id FROM Property__c WHERE Name = 'New Property 2' LIMIT 1];
        Account acc = [SELECT Id FROM Account LIMIT 1];
        Staff__c stf = [SELECT Id, Property__c FROM Staff__c LIMIT 1];
        
        Test.startTest();
        stf.Property__c = prop2.Id;
        update stf;
        Test.stopTest();
        
        List<Staff__c> stfList = [SELECT Id FROM Staff__c];
        Staff__c newStf = [SELECT Id, Property__c FROM Staff__c WHERE Property__r.Name = 'New Property 2' LIMIT 1];
        
        // Assert record was updated, not created or deleted
        System.assertEquals(1, stfList.size());
        // Assert property field has been updated
        System.assertEquals(prop2.Id, newStf.Property__c);
    }
    
    @isTest
    public static void deleteStaffTest() {
        // Test: Delete a staff record
        Staff__c stf = [SELECT Id, Property__c FROM Staff__c LIMIT 1];
        
        Test.startTest();
        delete stf;
        Test.stopTest();
        
        List<Staff__c> stfList = [SELECT Id FROM Staff__c];
        
        // Asset record was deleted
        System.assertEquals(0, stfList.size());
    }
}