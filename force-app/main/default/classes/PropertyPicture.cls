public class PropertyPicture {
    public static void getIds(id propertyId) {
        List<Id> idList = new List<Id>();
        List<ContentDocumentLink> linkList = [SELECT Id FROM ContentDocumentLink WHERE LinkedEntityID =: propertyId];
        for (ContentDocumentLink cdl : linkList) {
            idList.add(cdl.Id);
        }
        
        
        
        Property__c prop = [SELECT Picture__c FROM Property__c WHERE id =: propertyId];
        if (prop.Picture__c == null) {
            
        }
	}
}