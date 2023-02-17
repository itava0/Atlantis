public class PropertySchools {
    public static void AddSchools(Property__c propMain, String postalCode) {
        // Establish if a property already exists with the same postal code
        List<Property__c> propsWithZip = [SELECT Id FROM Property__c WHERE Billing_Postal_Code__c =: postalCode AND Id !=: propMain.Id];
        List<Id> propIds = new List<Id>();
        for (Property__c prop : propsWithZip) {
            propIds.add(prop.Id);
		}
        
        // If one or more properties at postal code already exist, create matching schools for the new property
        // --A junction object might be better practice here, but for the purposes of our org I think creating a
        // junction object for every school would use more data than simply having occasional duplicates)
        if (propsWithZip.size() > 0) {
            Id propSingle = propIds[0];
            List<School__c> schList = [SELECT Id, Name, Property__c, Rating__c, City__c, State__c, Postal_Code__c, Type__c, Maps_URL__c FROM School__c WHERE Property__c =: propSingle];
            List<School__c> schToAdd = new List<School__c>();
            for (School__c sch : schList) {
                School__c schNew = new School__c(Name = sch.Name, Property__c = propMain.Id, Rating__c = sch.Rating__c,
                                                City__c = sch.City__c, State__c = sch.State__c, Postal_Code__c = Integer.valueOf(postalCode),
                                                Type__c = sch.Type__c, Maps_URL__c = sch.Maps_URL__c);
                schToAdd.add(schNew);
            }
            insert schToAdd;
        } else {
            // If no properties at postal code exist, use real estate API to generate new schools for the property
            FindNearbySchools.getSchools(postalCode);
		}        
	}
}