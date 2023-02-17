@isTest
public class PropertyNullResetTest {
    @isTest
    public static void PropertyZeroesTest() {
        Property__c prop = new Property__c(Name = 'Space Needle', Status__c = 'Available', Billing_Street__c = '400 Broad St', Billing_City__c = 'Seattle',
                                       Billing_State__c = 'Washington', Billing_Postal_Code__c = '98109', Billing_Country__c = 'United States of America');
        
        Test.startTest();
        insert prop;
        Test.stopTest();
        
        Property__c propNew = [SELECT Id, Bedrooms__c, Bathrooms__c, Rent__c, Score__c, Balconies__c, Showers__c, Rating_Count__c FROM Property__c];
        
        // Assert filterable values default to 0 if null, to prevent issues with filtering properties
        System.assertEquals(0, propNew.Bedrooms__c);
        System.assertEquals(0, propNew.Bathrooms__c);
        System.assertEquals(0, propNew.Rent__c);
        System.assertEquals(0, propNew.Score__c);
        System.assertEquals(0, propNew.Balconies__c);
        System.assertEquals(0, propNew.Showers__c);
        System.assertEquals(0, propNew.Rating_Count__c);
	}
    
}