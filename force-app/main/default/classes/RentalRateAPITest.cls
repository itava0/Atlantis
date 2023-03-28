@isTest
private class RentalRateAPITest {
  @isTest
  static void testRentalRateAPI() {
    // Create a test Property__c record
    Property__c prop = new Property__c(Billing_State__c = 'California', Billing_Postal_Code__c = '92899', Billing_Street__c ='2300 Canterwood', Status__c = 'Available');
    insert prop;
    Id propId = prop.Id;

    // Call the RentalRateAPI method with the test property ID
    Test.startTest();
    String result = RentalRateAPI.RentalRateAPI(propId);
    Test.stopTest();

    // Verify that the response is not null
    System.assertNotEquals(null, result);
  }
}