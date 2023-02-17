public without sharing class CommunalSpaces {
    @auraEnabled(cacheable=true)
    public static List<Communal_Space__c> getCommunalSpaces(Id communityId)
    {
        return [SELECT Name, Community__c, Space_Type__c FROM Communal_Space__c WHERE Community__c = :communityId];
    }
    @auraEnabled(cacheable=true)
    public static Property_Communal_Space__c getCommunalJunction(Id communityId)
    {
        return [SELECT Id, Name FROM Property_Communal_Space__c WHERE Id = :communityId LIMIT 1];
    }
    @auraEnabled(cacheable=true)
    public static List<Property_Communal_Space__c> getAllCommunities()
    {
        return [SELECT Id, Name FROM Property_Communal_Space__c];
    }
    @auraEnabled(cacheable=true)
    public static Boolean isUserOwner(Id propertyId)
    {
        return [SELECT ID, Name FROM Contact WHERE AccountId IN (SELECT Account__c FROM Property_Owner__c WHERE Property__c = :propertyId) AND Id IN (SELECT ContactId FROM User WHERE Id = :UserInfo.getUserId())].size() > 0;
        /*
        List<Account> accList = [SELECT Id FROM Account WHERE Id IN (SELECT Account__c FROM Property_Owner__c WHERE Property__c = :propertyId)];
        List<Id> accIdList = new List<Id>();
        for(Account acc : accList)
        {
            accIdList.add(acc.Id);
        }
        return [SELECT ID, Name FROM Contact WHERE AccountId IN :accIdList AND Id IN (SELECT ContactId FROM User WHERE Id = :UserInfo.getUserId())].size() > 0;
        */
        //return [SELECT Id FROM Property__c WHERE Id = :propertyId AND OwnerId = :UserInfo.getUserId()].size() > 0;
    }
    @auraEnabled(cacheable=true)
    public static List<Property_Communal_Space__c> getOwnerCommunities()
    {
        return [SELECT Id, Name FROM Property_Communal_Space__c WHERE OwnerId = :UserInfo.getUserId()];
    }
    @auraEnabled(cacheable=false)
    public static void updateCommunity(Id recordId, Id communityId)
    {
        Property__c property = [SELECT Id, Name, Community__c FROM Property__c WHERE Id = :recordId];
        property.Community__c = communityId;
        if(communityId != null)
            property.In_Community__c = true;
        else
            property.In_Community__c = false;
        update property;
    }
    @auraEnabled(cacheable=false)
    public static void createCommunalSpace(Id communityId, String spaceType, String spaceName)
    {
        Communal_Space__c communalSpace = new Communal_Space__c();
        communalSpace.Space_Type__c = spaceType;
        communalSpace.Name = spaceName;
        communalSpace.Community__c = communityId;
        insert communalSpace;
    }
    @auraEnabled(cacheable=false)
    public static List<Communal_Space_Maintenance__c> getRelatedMaintenance()
    {
        Contact user = [SELECT Name, Id, AccountId FROM Contact WHERE Id IN (SELECT ContactId FROM User WHERE Id = :UserInfo.getUserId())][0];
        List<Tenant__c> tenants = [SELECT Property__c FROM Tenant__c WHERE Account__c = :user.AccountId];
        List<Id> propertyIds = new List<Id>();
        for (Tenant__c tenant : tenants) {
            propertyIds.add(tenant.Property__c);
        }
        List<Property__c> properties = [SELECT Id, Community__c FROM Property__c WHERE Id IN :propertyIds];
        List<Id> communityIds = new List<Id>();
        for(Property__c property : properties) {
        if(property.Community__c != null)
            communityIds.add(property.Community__c);
        }
        List<Communal_Space__c> communalSpaces = [SELECT Id, Name, Community__c, Space_Type__c FROM Communal_Space__c WHERE Community__c IN :communityIds];
        List<Id> communalSpaceIds = new List<Id>();
        for(Communal_Space__c communalSpace : communalSpaces) {
            communalSpaceIds.add(communalSpace.Id);
        }
        return [SELECT Id, Communal_Space__c, Maintenance_Start__c, Maintenance_End__c FROM Communal_Space_Maintenance__c WHERE Communal_Space__c IN :communalSpaceIds];
    }
    @auraEnabled
    public static List<Communal_Space_Maintenance__c> getMaintenance(Id communalSpaceId)
    {
        return [SELECT Id, Communal_Space__c, Maintenance_Start__c, Maintenance_End__c FROM Communal_Space_Maintenance__c WHERE Communal_Space__c = :communalSpaceId];
    }
}