public with sharing class CreateTenantUser {
  public static void tenantAcctWithLease(List<Contract> leaseObj) {
    //Adding the IDs of leases with status Activated
    List<Id> idList = new List<Id>();
    for (Contract lease : leaseObj) {
      if (lease.Status == 'Activated') {
        idList.add(lease.Id);
      }
    }

    system.debug('LeaseID' + idList);

    //Query the Account's Id that has a lease using the idList
    Contract acctId = [
      SELECT AccountId
      FROM Contract
      WHERE id = :idList
      LIMIT 1
    ];
    Account acct = [
      SELECT name, email__c
      FROM Account
      WHERE id = :AcctId.AccountId
      LIMIT 1
    ];
    Contact conId = [
      SELECT id
      FROM Contact
      WHERE AccountId = :AcctId.AccountId
      LIMIT 1
    ];
    //Spliting Account's name into separated values trailed by whitespaces
    String[] name = acct.name.split('\\s');
    system.debug('Acount Id with a lease ' + acctId);
    CreateTenantUser(
      name[0],
      name[1],
      acct.email__c,
      acctId.AccountId,
      conId.id
    );
  }

  @future(callout=true)
  public static void CreateTenantUser(
    String firstName,
    String lastName,
    String email,
    String acctId,
    String contId
  ) {
    system.debug('Firstname: ' + firstName);
    system.debug('AccountId ' + acctId);
    //Create portal account owner with a Atlantis Community User profile
    Profile profile1 = [
      SELECT Id
      FROM Profile
      WHERE name = 'Atlantis Community User'
      LIMIT 1
    ];
    User portalAccountOwner1 = new User(
      ProfileId = profile1.Id,
      ContactId = contId,
      Username = email + System.now().millisecond(),
      Alias = firstName.substring(0, 4),
      Email = email,
      EmailEncodingKey = 'UTF-8',
      Firstname = firstName,
      Lastname = lastName,
      LanguageLocaleKey = 'en_US',
      LocaleSidKey = 'en_US',
      TimeZoneSidKey = 'America/Chicago'
    );
    try {
      insert (portalAccountOwner1);
    } catch (Exception e) {
      System.debug('An unexpected error has occurred: ' + e.getMessage());
    }

    newTenantUser(firstName, lastName, email, acctId, portalAccountOwner1.id);
  }

  public static void newTenantUser(
    String firstName,
    String lastName,
    String email,
    String acctId,
    String portalAccountOwner1
  ) {
    //Query for an Account that has a lease
    Account tenantAct = [SELECT id, OwnerId FROM Account WHERE id = :acctId];

    try {
      //Update the Account's owner id
      tenantAct.OwnerId = portalAccountOwner1;

      Database.update(tenantAct);
    } catch (Exception e) {
      System.debug('An unexpected error has occurred: ' + e.getMessage());
    }

    //Create a community user with Atlantis Community User
    Profile p = [
      SELECT Id
      FROM Profile
      WHERE Name = 'Atlantis Community User'
      LIMIT 1
    ];
    User newUser = new User(
      UserName = email + math.random(),
      FirstName = firstName,
      LastName = lastName,
      Alias = firstName.substring(0, 4),
      email = email,
      CommunityNickName = firstName + math.random(),
      ProfileID = p.id,
      TimeZoneSidKey = 'America/New_York',
      LocaleSidKey = 'en_US',
      EmailEncodingKey = 'UTF-8',
      LanguageLocaleKey = 'en_US'
    );

    string userId = '';
    try {
      userId = Site.createExternalUser(newUser, tenantAct.id, null);
      System.Debug(userId);
    } catch (Site.ExternalUserCreateException ex) {
      List<String> errors = ex.getDisplayMessages();
      for (String error : errors) {
        System.debug(LoggingLevel.Error, 'Errrors:' + error);
      }
    }
  }
}