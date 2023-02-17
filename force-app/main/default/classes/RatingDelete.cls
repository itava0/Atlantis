public class RatingDelete {
    public static void RatingDeleted(List<Rating__c> ratTrigger) {
        for (Rating__c rat : ratTrigger) {
            Id ratPropId = rat.Property__c;
            Id ratUserId = rat.User__c;
            List<Rating__c> ratListAfter = [SELECT Id, Property__c, User__c, Score__c, Review__c FROM Rating__c WHERE Property__c =: ratPropId AND Id !=: rat.Id];
            
            Property__c prop = [SELECT Id, Score__c, Rating_Count__c FROM Property__c WHERE Id =: ratPropId];
            User usr = [SELECT Id FROM User WHERE Id =: ratUserId];
            
            Decimal ratiTotal = 0.0;
            Decimal ratiAmount = 0.0;
            Integer countRating = 0;

			// Calculate New Rating            
            if (ratListAfter.size() > 0) {
                for (Rating__c rati : ratListAfter) {
                    if (prop.Id == rati.Property__c) {
                        if (rati.Score__c != null) {
                            countRating++;
                            ratiTotal += Integer.valueof(rati.Score__c);
                            ratiAmount += 1.0;
                        }
                    }
                }
            }

            // Update Score
            if (ratListAfter.size() == 0) {
                prop.Score__c = 0.0;
                prop.Rating_Count__c = 0;
            } else {
                Decimal ratiOverall = (ratiTotal / ratiAmount).setScale(1);
            	// System.debug(ratiTotal + ' / ' + ratiAmount + ' = ' + ratiOverall);
                prop.Score__c = ratiOverall.setScale(1);
                prop.Rating_Count__c = countRating;
			}
            // System.debug(prop.Score__c);
            
            update prop;
        }
	}
}