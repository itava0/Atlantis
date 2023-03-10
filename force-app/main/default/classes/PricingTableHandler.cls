public without sharing class PricingTableHandler {
    @AuraEnabled
    public static String createPropertyOwner(String fName, String lName, String email, String newPhone, String nickName, String paymentPlan) {
        Id RecTypeId = '012Dn000000gsCuIAI';
        Account act = new Account(
        FirstName = fName,
        LastName = lName,
        OwnerId = '005Dn0000010qW4IAI',
        Email__c = email,
        PersonEmail = email,
        RecordTypeId = RecTypeId,
        Phone = newPhone
        //Payment_Plan__c = paymentPlan
        );
        Database.insert(act);
        act = [SELECT Id, PersonEmail, FirstName, LastName, PersonContactId FROM Account WHERE Id =: act.Id];
        Profile portalProfile = [SELECT Id FROM Profile WHERE Name='Atlantis Community User' Limit 1];
        String uName;
        if(act.LastName.length() < 7) {
            uName = act.FirstName.substring(0,1) + act.LastName;
        }
        else {
            uName = act.FirstName.substring(0,1) + act.LastName.substring(0,7);
        }
        User user1 = new User(
            UserName = act.PersonEmail,
            FirstName = act.FirstName,
            LastName = act.LastName,
            Alias = uName,
            email = act.PersonEmail,
            ContactId = act.PersonContactId,
            ProfileId = portalProfile.Id,
            EmailEncodingKey = 'UTF-8',
            CommunityNickname = nickName,
            TimeZoneSidKey = 'America/Los_Angeles',
            LocaleSidKey = 'en_US',
            LanguageLocaleKey = 'en_US'
        );
        Database.DMLOptions dlo = new Database.DMLOptions();
        dlo.EmailHeader.triggerUserEmail = true;
        Database.insert(user1);
        return String.valueOf(act.Id);
    }
}