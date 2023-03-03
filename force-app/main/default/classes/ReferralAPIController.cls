@RestResource(urlMapping='/Referral/*')
global with sharing class ReferralAPIController {
  @HttpPost
  global static String doPost(
    String fName,
    String lName,
    String phone,
    String email,
    Id propertyId,
    String message
  ) {
    Referral__C referralUser = new Referral__C();
    referralUser.Name = fName + ' ' + lName;
    referralUser.phone__C = phone;
    referralUser.email__C = email;
    referralUser.Property__c = propertyId;
    referralUser.message__c = message;
    insert referralUser;
    return referralUser.Id;
  }
}