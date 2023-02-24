public class PropertyDelete {
    public static void DeleteRelated(List<Property__c> propList) {
        List<Id> propIds = new List<Id>();
        for (Property__c prop : propList) {
            propIds.add(prop.Id);
        }
        
        // Delete associated ratings if property deleted
        List<Rating__c> ratList = [SELECT Id, Property__c FROM Rating__c WHERE Property__c IN: propIds];
        delete ratList;
	}
}