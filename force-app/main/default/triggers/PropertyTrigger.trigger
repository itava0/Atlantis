trigger PropertyTrigger on Property__c (before insert, after insert, before update, after update, before delete) {
    
    if (Trigger.isBefore && Trigger.isInsert) {
        for (Property__c prop : Trigger.new) {
            // Before Insert: Update certain null values to 0
            PropertyNullReset.PropertyZeroes(Trigger.new);
        }
	}
    
    if (Trigger.isAfter && Trigger.isInsert) {
        for (Property__c prop : Trigger.new) {
            // After Insert: Geocode property if necessary, and add new schools if necessary
            PropertySchools.AddSchools(prop, String.valueOf(prop.Billing_Postal_Code__c));
            if (prop.Geolocation__Latitude__s == null || prop.Geolocation__Longitude__s == null) {
                PropertyGeocode.DoAddressGeocode(prop.id);
                // PropertyGeocode.DoAddressGeocodeProperty(Trigger.new, prop.Billing_Street__c, prop.Billing_City__c, prop.Billing_State__c, prop.Billing_Postal_Code__c);
            }
        }
    }

    if (Trigger.isBefore && Trigger.isUpdate) {
        for (Property__c prop : Trigger.new) {
            // Before Update: Update certain null values to 0
            PropertyNullReset.PropertyZeroes(Trigger.new);
        }
	}
    
    if (Trigger.isAfter && Trigger.isUpdate) {
        for (Property__c prop : Trigger.new) {
            // After Update: Geocode property if necessary
            if (prop.Geolocation__Latitude__s == null || prop.Geolocation__Longitude__s == null ||
                prop.Billing_Street__c != Trigger.oldMap.get(prop.id).Billing_Street__c || prop.Billing_City__c != Trigger.oldMap.get(prop.id).Billing_City__c ||
                prop.Billing_State__c != Trigger.oldMap.get(prop.id).Billing_State__c || prop.Billing_Postal_Code__c != Trigger.oldMap.get(prop.id).Billing_Postal_Code__c) {
                    PropertyGeocode.DoAddressGeocode(prop.id);
                    // PropertyGeocode.DoAddressGeocodeProperty(Trigger.new, prop.Billing_Street__c, prop.Billing_City__c, prop.Billing_State__c, prop.Billing_Postal_Code__c);
                }
        }
    }
    

    if (Trigger.isBefore && Trigger.isDelete) {
        for (Property__c prop : Trigger.old) {
            // Before Delete: For cleanup purposes, delete related records to the property, including ratings, schools, and junction objects
            PropertyDelete.DeleteRelated(Trigger.old);
        }
	}
}