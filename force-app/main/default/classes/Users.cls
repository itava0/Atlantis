public with sharing class Users {
  @AuraEnabled(cacheable=false)
  public static List<User> getUsers() {
    List<User> users = new List<User>(
      [
        SELECT Id, Name, Email, IsActive, Account.RecordTypeId
        FROM User
        WHERE Account.Id != NULL
      ]
    );
    return users;
  }
  @AuraEnabled
  public static Map<Id, String> getRecordTypes() {
    Map<Id, String> recordTypes = new Map<Id, String>();
    List<RecordType> rts = [
      SELECT Id, Name
      FROM RecordType
      WHERE SobjectType = 'Account'
    ];
    for (RecordType rt : rts) {
      //if(rt.Name == 'Person Account')
      //    recordTypes.put(rt.Id, 'Tenant');
      //else
      recordTypes.put(rt.Id, rt.Name);
    }
    return recordTypes;
    //Schema.getGlobalDescribe().get(Account).getDescribe().getRecordTypeInfosById().get(strRecordTypeId).getName();
  }

  @AuraEnabled
  public static User getUserInfo() {
    Id userId = UserInfo.getUserId();
    if(!Auth.CommunitiesUtil.isGuestUser())
    {
      User user = [
        SELECT Id, FirstName, LastName, Email, IsActive, Account.RecordTypeId, Phone
        FROM User
        WHERE Id = :userId
      ];
      return user;
    }
    return null;
  }

  @AuraEnabled
  public static String postUserInfo(String firstName, String lastName, String email, String phone, String endpoint, Id propertyId, String originCompany) {
    HttpRequest req = new HttpRequest();
    req.setEndpoint(endpoint);
    req.setMethod('POST');
    req.setHeader('Content-Type', 'application/json');
    Map<String,Object> body = new Map<String,Object>();
    if(originCompany == 'CXPW')
    {
      body.put('firstName', firstName);
      body.put('lastName', lastName);
      body.put('email', email);
      body.put('phone', phone);
      body.put('propertyId', propertyId);
      body.put('companyName', 'Atlantis Property Company');
    }
    else if(originCompany == 'Mooreland')
    {
      body.put('firstName', firstName);
      body.put('lastName', lastName);
      body.put('Email', email);
      body.put('Phone', phone);
      body.put('PropertyId', propertyId);
      body.put('CompanyName', 'Atlantis Property Company');
    }
    req.setBody(JSON.serialize(body));
    Http http = new Http();
    HttpResponse res = http.send(req);
    return res.getBody();
  }
}