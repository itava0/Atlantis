@isTest
public class PostalCodeTest {
    @isTest
    public static void PostalCodeValidationTest() {
        // prop1 has correct zip code of 02215
        Property__c prop1 = new Property__c(Name = 'Fenway Park', Status__c = 'Available', Billing_Country__c = 'United States of America',
                                           Billing_State__c = 'Massachusetts', Billing_Street__c = '4 Jersey St', Billing_City__c = 'Boston',
                                           Billing_Postal_Code__c = '02215');
        // prop2 has correct zip code of 60613 
        Property__c prop2 = new Property__c(Name = 'Wrigley Field', Status__c = 'Rented', Billing_Country__c = 'United States of America',
                                           Billing_State__c = 'Illinois', Billing_Street__c = '1060 W Addison St', Billing_City__c = 'Chicago',
                                           Billing_Postal_Code__c = '60613');
        // prop3 has wrong zip code; correct zip code is 10451
        Property__c prop3 = new Property__c(Name = 'Yankees Stadium', Status__c = 'Rented', Billing_Country__c = 'United States of America',
                                           Billing_State__c = 'New York', Billing_Street__c = '1 E 161 St', Billing_City__c = 'The Bronx',
                                           Billing_Postal_Code__c = '34871');
            
       	// Add three properties to list
        List<Property__c> propList = new List<Property__c>();
        propList.add(prop1);
        propList.add(prop2);
        propList.add(prop3);
        
        // Test: inserting propList with 1 of 3 having incorrect postal code
        Test.startTest();
        try {
            insert propList;
        } catch (Exception e) {
            // Assert error occurs
            System.assert(e.getMessage().contains('Billing postal code must match billing state'));
		}

		// Fix incorrect entry, try inserting again, check results, and update prop1's postal code to an incorrect value        
        prop3.Billing_Postal_Code__c = '10451';
        insert propList;
        List<Property__c> propResults = [SELECT Id, Billing_Postal_Code__c FROM Property__c];
        prop1.Billing_Postal_Code__c = '99999';
        
        // Test: updating prop1 with incorrect postal code
        try {
            update prop1;
        } catch (Exception ee) {
            // Assert error occurs
            System.assert(ee.getMessage().contains('Billing postal code must match billing state'));
        }
        
        // Check results
        Property__c prop1Final = [SELECT Id, Name, Billing_Postal_Code__c FROM Property__c WHERE Name = 'Fenway Park'];
        Test.stopTest();
        
        // Assert all 3 properties were added (after updating to correct values)
        System.assertEquals(3, propResults.size());
        // Assert prop1's postal code was not changed to an incorrect value
        System.assertEquals('02215', prop1Final.Billing_Postal_Code__c);
    }
}