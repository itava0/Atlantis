public class PropertyDelete {
    public static void DeleteRelated(List<Property__c> propList) {
        List<Id> propIds = new List<Id>();
        for (Property__c prop : propList) {
            propIds.add(prop.Id);
        }
        List<Rating__c> ratList = [SELECT Id, Property__c FROM Rating__c WHERE Property__c IN: propIds];
        List<School__c> schList = [SELECT Id FROM School__c WHERE Property__c IN: propIds];
        List<Property_Owner__c> ownList = [SELECT Id FROM Property_Owner__c WHERE Property__c IN: propIds];
        List<Tenant__c> tenList = [SELECT Id FROM Tenant__c WHERE Property__c IN: propIds];
        
        delete ratList;
        delete schList;
        delete ownList;
        delete tenList;
	}
}