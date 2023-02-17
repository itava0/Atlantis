public class PropertyNullReset {
    public static void PropertyZeroes(List<Property__c> propList) {
        for (Property__c prop : propList) {
            if (prop.Bedrooms__c == null) {
                prop.Bedrooms__c = 0;
            }
            if (prop.Bathrooms__c == null) {
                prop.Bathrooms__c = 0;
            }
            if (prop.Rent__c == null) {
                prop.Rent__c = 0;
            }
            if (prop.Score__c == null) {
                prop.Score__c = 0;
            }
            if (prop.Balconies__c == null) {
                prop.Balconies__c = 0;
            }
            if (prop.Showers__c == null) {
                prop.Showers__c = 0;
            }
            if (prop.Rating_Count__c == null) {
                prop.Rating_Count__c = 0;
			}
        }
	}
}