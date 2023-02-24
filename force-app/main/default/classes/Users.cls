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
}