public class RatingUpdateInsert {
    public static void RatingUpdatedInserted(List<Rating__c> ratTrigger) {
        for (Rating__c rat : ratTrigger) {
            Id ratPropId = rat.Property__c;
            Id ratUserId = rat.User__c;
            List<Rating__c> ratList = [SELECT Id, Property__c, User__c, Score__c, Review__c FROM Rating__c WHERE Property__c =: ratPropId];
            
            Property__c prop = [SELECT Id, Score__c, Rating_Count__c FROM Property__c WHERE Id =: ratPropId];
            User usr = [SELECT Id FROM User WHERE Id =: ratUserId];
			
            // Ensure One Rating Per User & Property Combination
            for (Rating__c ra : ratList) {
                if (ra.Property__c == ratPropId && ra.User__c == ratUserId && ra.Id != rat.Id) {
                    throw new RatingException('This user already has rated this property. Try updating the rating instead of creating a new one.');
                }
            }
            
            Decimal ratiTotal = 0.0;
            Decimal ratiAmount = 0.0;
            Integer countRating = 0;
            
            // Calculate New Rating
            for (Rating__c rati : ratList) {
                if (prop.Id == rati.Property__c) {
                    if (rati.Score__c != null) {
                        countRating++;
                        ratiTotal += Integer.valueof(rati.Score__c);
                        ratiAmount += 1.0;
                    }
                }
            }
                    
            Decimal ratiOverall = (ratiTotal / ratiAmount).setScale(1);
            
            // System.debug(ratiTotal + ' / ' + ratiAmount + ' = ' + ratiOverall);
            prop.Score__c = ratiOverall.setScale(1);
            prop.Rating_Count__c = countRating;

            update prop;
        }
	}
}