@RestResource(urlMapping='/Properties/*')
global with sharing class PropertyAPIController {
  @HttpGet
  global static List<Property__C> doGet() {
    RestRequest req = RestContext.request;
    RestResponse res = RestContext.response;
    List<Property__C> result = [
      SELECT
        Id,
        Name,
        Balconies__c,
        Bathrooms__c,
        Bedrooms__c,
        Billing_City__c,
        Billing_Country__c,
        Billing_Postal_Code__c,
        Billing_State__c,
        Billing_Street__c,
        Picture__c,
        Rent__c,
        Year_Built__c,
        Origin_Company__c
      FROM Property__c
    ];

    return result;
  }
}