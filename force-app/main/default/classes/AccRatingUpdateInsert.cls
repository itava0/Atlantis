public class AccRatingUpdateInsert {
    public static void AccRatingUpdatedInserted(List<AccRating__c> ratTrigger) {
        for (AccRating__c rat : ratTrigger) {
            Id ratAccId = rat.Account__c;
            Id ratUserId = rat.User__c;
            List<AccRating__c> ratList = [SELECT Id, Account__c, User__c, Score__c, Review__c FROM AccRating__c WHERE Account__c =: ratAccId];
            
            Account acc = [SELECT Id, Score__c, Rating_Count__c FROM Account WHERE Id =: ratAccId];
            User usr = [SELECT Id FROM User WHERE Id =: ratUserId];
            
            // Ensure One Rating Per User & Account Combination
            for (AccRating__c ra : ratList) {
                if (ra.Account__c == ratAccId && ra.User__c == ratUserId && ra.Id != rat.Id) {
                    throw new RatingException('This user has already rated this account. Try updating the rating instead of creating a new one.');
                }
            }
            
            Decimal ratiTotal = 0.0;
            Decimal ratiAmount = 0.0;
            Integer countRating = 0;
            
            // Calculate New Account Rating
            for (AccRating__c rati : ratList) {
                if (acc.Id == rati.Account__c) {
                    if (rati.Score__c != null) {
                        countRating++;
                        ratiTotal += Integer.valueOf(rati.Score__c);
                        ratiAmount += 1.0;
                    }
                }
            }
            
            Decimal ratiOverall = (ratiTotal / ratiAmount).setScale(1);
            
            // System.debug(ratiTotal + ' / ' + ratiAmount + ' = ' + ratiOverall);
            acc.Score__c = ratiOverall.setScale(1);
            acc.Rating_Count__c = countRating;
            
            update acc;
        }
    }
}